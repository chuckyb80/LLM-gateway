ALTER TABLE "api_key_hourly_model_stats" ADD COLUMN "image_input_tokens" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "api_key_hourly_model_stats" ADD COLUMN "image_output_tokens" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "api_key_hourly_stats" ADD COLUMN "image_input_tokens" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "api_key_hourly_stats" ADD COLUMN "image_output_tokens" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "project_hourly_model_stats" ADD COLUMN "image_input_tokens" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "project_hourly_model_stats" ADD COLUMN "image_output_tokens" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "project_hourly_stats" ADD COLUMN "image_input_tokens" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "project_hourly_stats" ADD COLUMN "image_output_tokens" numeric DEFAULT '0' NOT NULL;