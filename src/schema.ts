import { type InferModel } from 'drizzle-orm';
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
