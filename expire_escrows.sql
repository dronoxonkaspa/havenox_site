--  This script marks stale escrows as expired and refunds parties if needed
--  Run manually in SQL Editor or automate via Supabase Edge Function/Cron

update escrow_sessions
set status = 'expired'
where status = 'pending'
  and created_at < now() - interval '24 hours';

--  Optional: Insert log entry in trade_history for audit trail
insert into trade_history (wallet, nft_name, price, network, action)
select buyer, 'Escrow Expired', price, network, 'Refunded'
from escrow_sessions
where status = 'expired'
  and created_at < now() - interval '24 hours';
