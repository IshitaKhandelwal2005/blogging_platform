CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "post_categories" (
	"post_id" serial NOT NULL,
	"category_id" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"slug" varchar(255) NOT NULL,
	"published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
