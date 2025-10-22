// Load environment variables from .env/.env.local when running via npm
try {
	require('dotenv').config();
} catch (e) {
	// dotenv is optional; if not installed the environment must be provided externally
}

const { Client } = require('pg');
const slugify = require('slugify');

async function run() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		console.error('Please set DATABASE_URL in environment');
		process.exit(1);
	}

	// Debug: parse and show which DB user/host/db we're connecting to (mask password)
	try {
		const parsed = new URL(connectionString);
		const connUser = parsed.username || '(none)';
		const connHost = parsed.hostname || '(none)';
		const connDb = (parsed.pathname || '').replace('/', '') || '(none)';
		console.log(`Connecting to database user='${connUser}' host='${connHost}' db='${connDb}'`);
	} catch (e) {
		// ignore
	}

	const client = new Client({ connectionString });
	await client.connect();

	// Create tables
	await client.query(`
		create table if not exists posts (
			id serial primary key,
			title varchar(255) not null,
			content text not null,
			slug varchar(255) not null,
			published boolean default false,
			created_at timestamptz default now()
		);
	`);

	await client.query(`
		create table if not exists categories (
			id serial primary key,
			name varchar(100) not null,
			slug varchar(100) not null,
			description text
		);
	`);

	await client.query(`
		create table if not exists post_categories (
			post_id integer not null references posts(id) on delete cascade,
			category_id integer not null references categories(id) on delete cascade,
			primary key (post_id, category_id)
		);
	`);

	// Add unique indexes for slugs
	await client.query(`create unique index if not exists idx_posts_slug on posts(slug);`);
	await client.query(`create unique index if not exists idx_categories_slug on categories(slug);`);

	// Clear existing data
	console.log('Clearing existing data...');
	await client.query('truncate posts, categories, post_categories cascade');

	// Insert sample categories
	console.log('Creating categories...');
	const categories = [
		{ name: 'Design', description: 'UI/UX design principles and practices' },
		{ name: 'Development', description: 'Software development and engineering' },
		{ name: 'Architecture', description: 'System design and architecture patterns' },
		{ name: 'DevOps', description: 'DevOps practices and tools' },
		{ name: 'Frontend', description: 'Frontend development and frameworks' },
		{ name: 'Backend', description: 'Backend development and databases' },
		{ name: 'Career', description: 'Career growth and professional development' },
		{ name: 'Tutorials', description: 'Step-by-step guides and tutorials' }
	];

	for (const c of categories) {
		const slug = slugify(c.name, { lower: true });
		await client.query(
			`insert into categories(name, slug, description) values($1, $2, $3) on conflict (slug) do nothing`,
			[c.name, slug, c.description]
		);
	}

	// Insert sample posts
	console.log('Creating posts...');
	const posts = [
		{
			title: 'Getting Started with Next.js 15',
			content: `
# Getting Started with Next.js 15

Next.js 15 brings revolutionary changes to web development. Let's explore the key features and how to use them effectively.

## What's New

- App Router improvements
- Server Actions enhancements
- Partial rendering optimizations

## Quick Start

\`\`\`bash
npx create-next-app@latest my-app --ts
cd my-app
npm run dev
\`\`\`

## Key Concepts

1. Server Components
2. Client Components
3. Data Fetching
4. Route Handlers

Learn more in the [documentation](https://nextjs.org).
			`,
			categories: ['Frontend', 'Development', 'Tutorials'],
			published: true
		},
		{
			title: 'Modern System Design Patterns',
			content: `
# Modern System Design Patterns

Exploring contemporary approaches to building scalable systems.

## Key Patterns

### Event-Driven Architecture

Event-driven architectures help build loosely coupled systems that are:
- Scalable
- Maintainable
- Resilient

### Microservices

Breaking down complex systems into manageable pieces:

1. Service Discovery
2. Load Balancing
3. Circuit Breaking

## Implementation Tips

Always consider:
- Performance
- Scalability
- Maintainability
			`,
			categories: ['Architecture', 'Backend', 'Development'],
			published: true
		},
		{
			title: 'The Art of API Design',
			content: `
# The Art of API Design

Creating intuitive and maintainable APIs is crucial for modern software development.

## REST Best Practices

### Naming Conventions

- Use nouns for resources
- Keep URLs simple and intuitive
- Use proper HTTP methods

### Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## GraphQL Considerations

When to choose GraphQL:
1. Complex data requirements
2. Multiple client platforms
3. Frequent API changes

\`\`\`graphql
type Query {
  user(id: ID!): User
  posts(userId: ID!): [Post!]!
}
\`\`\`
			`,
			categories: ['Development', 'Backend', 'Architecture'],
			published: true
		},
		{
			title: 'Mastering CSS Grid Layout',
			content: `
# Mastering CSS Grid Layout

CSS Grid has revolutionized web layouts. Let's explore its power.

## Basic Concepts

### Grid Container

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
\`\`\`

### Grid Areas

\`\`\`css
.layout {
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}
\`\`\`

## Common Patterns

1. Holy Grail Layout
2. Card Grid
3. Responsive Dashboard

## Tips and Tricks

- Use minmax() for flexibility
- Consider auto-fit/auto-fill
- Don't forget about grid-auto-flow
			`,
			categories: ['Frontend', 'Design', 'Tutorials'],
			published: true
		},
		{
			title: 'Developer Career Growth',
			content: `
# Developer Career Growth

Navigate your software development career successfully.

## Key Areas

1. Technical Skills
   - Keep learning new technologies
   - Master your current stack
   - Understand fundamentals deeply

2. Soft Skills
   - Communication
   - Team collaboration
   - Problem-solving
   - Time management

3. Leadership
   - Mentoring others
   - Project management
   - Technical decision making

## Action Plan

Create a personal development plan:
- Set quarterly goals
- Track progress
- Seek feedback
- Build a portfolio

## Resources

- Online courses
- Technical books
- Conferences
- Open source contributions
			`,
			categories: ['Career'],
			published: true
		}
	];

	for (const p of posts) {
		const slug = slugify(p.title, { lower: true });
		const res = await client.query(
			`insert into posts(title, content, slug, published) values($1, $2, $3, $4) on conflict (slug) do update set title = excluded.title returning id`,
			[p.title, p.content, slug, p.published]
		);
		const postId = res.rows[0].id;

		// assign categories
		for (const catName of p.categories) {
			const cat = await client.query(`select id from categories where name = $1 limit 1`, [catName]);
			if (cat.rows[0]) {
				await client.query(
					`insert into post_categories(post_id, category_id) values($1, $2) on conflict do nothing`,
					[postId, cat.rows[0].id]
				);
			}
		}
	}

	console.log('Seed completed');
	await client.end();
}

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
