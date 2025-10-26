-- Add a listing_fee column to store the fixed 10 KAS charge
alter table listings
  add column if not exists listing_fee numeric default 10;

-- Optionally, record the fee currency for clarity
alter table listings
  add column if not exists fee_currency text default 'KAS';

-- Set all existing listings to the current 10 KAS fee
update listings set listing_fee = 10 where listing_fee is null;
