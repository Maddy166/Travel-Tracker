-- SCHEMA

create table states(
	id serial primary key,
	state_name varchar(50),
	state_code varchar(2)
);

create table users(
	id serial primary key,
	email text not null unique,
	password not null text,
);

create table members(
	id serial primary key,
	name varchar(20),
	color varchar(20),
	user_id integer references users(id) ON DELETE CASCADE
);

-- old
create table visited_states(
	id serial primary key,
	state_code varchar(2),
	member_id integer references members(id) ON DELETE CASCADE,
    user_id integer references users(id) ON DELETE CASCADE,
	unique (state_code, member_id),
);

-- With expereince
create table visited_states(
	id serial primary key,
	state_code varchar(2),
	member_id integer references members(id) ON DELETE CASCADE,
    user_id integer references users(id) ON DELETE CASCADE,
	start_date date,
	end_date date,
	experience text,
	unique (state_code, member_id)
);