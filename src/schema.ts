import { sql, type InferModel } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
	'users',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		email: text('email').notNull(),
		password: text('password'),
	},
	(users) => ({
		emailIdx: uniqueIndex('emailIdx').on(users.email),
	})
);

export const sessions = sqliteTable('user_sessions', {
	userId: integer('user_id').notNull(),
	sessionId: text('session_id').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }),
});

export const inviteCodes = sqliteTable('invite_codes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	code: text('code').notNull(),
	active: integer('active', { mode: 'boolean' }).notNull(),
});

export const links = sqliteTable(
	'links',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		name: text('name').notNull(),
		key: text('key').notNull(),
		destination: text('destination').notNull(),
		createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
		updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
	},
	(links) => ({
		keyIdx: uniqueIndex('keyIdx').on(links.key),
	})
);
