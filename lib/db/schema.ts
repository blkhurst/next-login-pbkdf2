import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  smallint,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  hash: text("hash").notNull(),
  salt: text("salt").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  kdfType: smallint("kdf_type").notNull(),
  encType: smallint("enc_type").notNull(),
  iterations: integer("iterations").notNull(),
  protectedSymmetricKey: text("protected_symmetric_key").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// One-to-many: a user has many notes
export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
}));

// Many-to-one: a note belongs to one user
export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
