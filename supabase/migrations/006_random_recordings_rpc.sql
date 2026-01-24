-- Function to get random recordings with filters
create or replace function get_random_recordings(
  limit_count int,
  filter_reciter_id uuid default null,
  filter_section_slug text default null
)
returns setof recordings
language sql
as $$
  select r.*
  from recordings r
  join sections s on r.section_id = s.id
  where r.is_published = true
  and (filter_reciter_id is null or r.reciter_id = filter_reciter_id)
  and (filter_section_slug is null or s.slug = filter_section_slug)
  order by random()
  limit limit_count;
$$;
