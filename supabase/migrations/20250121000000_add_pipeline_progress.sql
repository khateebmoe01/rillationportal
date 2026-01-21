-- Add pipeline_progress column to crm_contacts table
-- This column stores JSON data for tracking pipeline milestones

ALTER TABLE crm_contacts 
ADD COLUMN IF NOT EXISTS pipeline_progress JSONB DEFAULT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_crm_contacts_pipeline_progress 
ON crm_contacts USING GIN (pipeline_progress);

-- Add comment to document the column
COMMENT ON COLUMN crm_contacts.pipeline_progress IS 'Tracks pipeline progress milestones with dates: meeting_booked, disco_show, qualified, demo_booked, demo_show, proposal_sent, closed';
