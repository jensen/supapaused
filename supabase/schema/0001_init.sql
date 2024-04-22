drop table if exists messages;
drop table if exists events;
drop table if exists profiles_private;
drop table if exists profiles;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar text
);

drop table if exists profiles_private;

create table profiles_private (
  id uuid primary key references profiles(id) on delete cascade,
  email text,
  admin boolean default false not null
);

alter table
  profiles_private enable row level security;

create policy "Profiles are only visible by the user who owns it" on profiles_private for
select
  using (auth.uid() = id);

drop trigger if exists on_auth_user_created on auth.users;

drop function if exists handle_new_user();
create function handle_new_user() returns trigger language plpgsql security definer
set search_path = public as $$ begin
insert into
  profiles (id, name, avatar)
values
  (
    new.id,
    new.raw_user_meta_data :: json ->> 'full_name',
    new.raw_user_meta_data :: json ->> 'avatar_url'
  );

insert into
  profiles_private (id, email)
values
  (new.id, new.email);

perform
    net.http_post(
        url:='https://hjitlwxnztokymdoedlj.supabase.co/functions/v1/sync-avatar',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer <API_KEY>"}'::jsonb,
        body:=concat('{"id": "', new.id, '"}')::jsonb
    );

return new;

end;
$$;

create trigger on_auth_user_created
after
insert
  on auth.users for each row execute procedure handle_new_user();

create type event_type as enum ('warning', 'paused');

create table events (
  id uuid default extensions.uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  type event_type,
  name text,
  date timestamp with time zone not null,
  message_id text,

  user_id uuid default auth.uid() not null,
  constraint user_id foreign key(user_id) references profiles(id) on delete cascade
);

create type queue_status as enum ('queued', 'processing', 'completed', 'failed');

create table sync_queue (
  id serial primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  visible_at timestamp with time zone default current_timestamp,
  status queue_status default 'queued',
  data jsonb,
  priority integer default 1
);

create or replace function enqueue_task(data jsonb, priority int, delay_interval interval default '0 second')
returns void as $$
begin
    insert into sync_queue (status, data, priority, visible_at, created_at, updated_at)
    values ('queued', data, priority, current_timestamp + delay_interval, current_timestamp, current_timestamp);
end;
$$ language plpgsql;

create or replace function dequeue_task(count int default 1)
returns table(id int, data jsonb) as $$
begin
    return query (
      with available as (
        select sync_queue.id
        from sync_queue
        where status = 'queued' and visible_at <= current_timestamp
        order by priority desc, created_at asc
        for update skip locked
        limit count
      ), updated as (
        update sync_queue q
        set status = 'processing', updated_at = current_timestamp
        from available
        where q.id = available.id
        returning q.id as id, q.data as data
      ) select * from updated
    );
end;
$$ language plpgsql;

create or replace function complete_task(task_id int, success boolean, error_data text default null)
returns void as $$
begin
    if success then
        update sync_queue
        set status = 'completed',
            data = data - 'token',
            updated_at = current_timestamp
        where id = task_id;
    else
        update sync_queue
        set status = 'failed',
            data = jsonb_set(data, '{error}', to_jsonb(error_data)),
            updated_at = current_timestamp
        where id = task_id;
    end if;
end;
$$ language plpgsql;

select cron.schedule (
    'sync-gmail',
    '1 second',
    $$
    select
      net.http_post(
          url:='https://hjitlwxnztokymdoedlj.supabase.co/functions/v1/sync-gmail',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer <API_KEY>"}'::jsonb,
          body:=concat('{}')::jsonb
      ) as request_id; 
    $$
);