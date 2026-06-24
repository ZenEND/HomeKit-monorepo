-- Add enrichment metadata columns to media_titles
-- These columns persist rich data from AniList, Shikimori, and AniHub that
-- was previously fetched but discarded. Safe to run multiple times (IF NOT EXISTS).

ALTER TABLE media_titles
  ADD COLUMN IF NOT EXISTS next_episode_number integer      NULL,
  ADD COLUMN IF NOT EXISTS studios             jsonb        NULL,
  ADD COLUMN IF NOT EXISTS tags                jsonb        NULL,
  ADD COLUMN IF NOT EXISTS popularity          integer      NULL,
  ADD COLUMN IF NOT EXISTS fandubbers          jsonb        NULL,
  ADD COLUMN IF NOT EXISTS fansubbers          jsonb        NULL;

COMMENT ON COLUMN media_titles.next_episode_number IS 'Next airing episode number from AniList nextAiringEpisode.episode';
COMMENT ON COLUMN media_titles.studios            IS 'Main production studios (AniList), or dubbing studios (AniHub fallback)';
COMMENT ON COLUMN media_titles.tags               IS 'Up to 10 genre/theme tags from AniList';
COMMENT ON COLUMN media_titles.popularity         IS 'AniList popularity score (number of users who have the title in their list)';
COMMENT ON COLUMN media_titles.fandubbers         IS 'Ukrainian/Russian fan dubbing groups from Shikimori';
COMMENT ON COLUMN media_titles.fansubbers         IS 'Ukrainian/Russian fan subbing groups from Shikimori';
