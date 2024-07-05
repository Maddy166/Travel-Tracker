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

-- States Table Data

-- id,state_code,state_name
-- 1,AP,Andhra Pradesh
-- 2,AR,Arunachal Pradesh
-- 3,AS,Assam
-- 4,BR,Bihar
-- 5,CT,Chhattisgarh
-- 6,GA,Goa
-- 7,GJ,Gujarat
-- 8,HR,Haryana
-- 9,HP,Himachal Pradesh
-- 10,JH,Jharkhand
-- 11,KA,Karnataka
-- 12,KL,Kerala
-- 13,MP,Madhya Pradesh
-- 14,MH,Maharashtra
-- 15,MN,Manipur
-- 16,ML,Meghalaya
-- 17,MZ,Mizoram
-- 18,NL,Nagaland
-- 19,OR,Odisha
-- 20,PB,Punjab
-- 21,RJ,Rajasthan
-- 22,SK,Sikkim
-- 23,TN,Tamil Nadu
-- 24,TG,Telangana
-- 25,TR,Tripura
-- 26,UP,Uttar Pradesh
-- 27,UT,Uttarakhand
-- 28,WB,West Bengal
-- 29,AN,Andaman and Nicobar Islands
-- 30,CH,Chandigarh
-- 31,DH,Dadra and Nagar Haveli and Daman and Diu
-- 32,DD,Lakshadweep
-- 33,DL,Delhi
-- 34,LD,Ladakh
-- 35,JK,Jammu and Kashmir
-- 36,LA,Lakshadweep