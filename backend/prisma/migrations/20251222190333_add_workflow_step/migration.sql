-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "badge_number" TEXT NOT NULL,
    "employer" TEXT,
    "membership_expiry" DATETIME NOT NULL,
    "total_debt" DECIMAL NOT NULL DEFAULT 0.00,
    "role" TEXT NOT NULL DEFAULT 'member',
    "status" TEXT NOT NULL DEFAULT 'active',
    "password_hash" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "membership_renewals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "admin_id" TEXT,
    "previous_expiry" DATETIME NOT NULL,
    "new_expiry" DATETIME NOT NULL,
    "amount" DECIMAL NOT NULL,
    "payment_method" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "membership_renewals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "membership_renewals_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category_id" TEXT,
    "weekly_price" DECIMAL NOT NULL DEFAULT 0.00,
    "purchase_price" DECIMAL,
    "purchase_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'available',
    "maintenance_importance" TEXT NOT NULL DEFAULT 'low',
    "maintenance_interval" INTEGER,
    "last_maintenance_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tools_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tool_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tool_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tool_images_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tool_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tool_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'other',
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tool_documents_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tool_conditions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tool_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "status_at_time" TEXT NOT NULL,
    "comment" TEXT,
    "cost" DECIMAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tool_conditions_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tool_conditions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "condition_attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "condition_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "condition_attachments_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "tool_conditions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rentals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "tool_id" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "actual_return_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "total_price" DECIMAL,
    "return_comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "rentals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rentals_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rental_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rental_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "comment" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rental_history_rental_id_fkey" FOREIGN KEY ("rental_id") REFERENCES "rentals" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rental_history_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "type" TEXT NOT NULL,
    "method" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "workflow_step" TEXT NOT NULL DEFAULT 'requested',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_badge_number_key" ON "users"("badge_number");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_badge_number_idx" ON "users"("badge_number");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_membership_expiry_idx" ON "users"("membership_expiry");

-- CreateIndex
CREATE INDEX "membership_renewals_user_id_idx" ON "membership_renewals"("user_id");

-- CreateIndex
CREATE INDEX "membership_renewals_created_at_idx" ON "membership_renewals"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE INDEX "tools_status_idx" ON "tools"("status");

-- CreateIndex
CREATE INDEX "tools_category_id_idx" ON "tools"("category_id");

-- CreateIndex
CREATE INDEX "tools_title_idx" ON "tools"("title");

-- CreateIndex
CREATE INDEX "tool_images_tool_id_idx" ON "tool_images"("tool_id");

-- CreateIndex
CREATE INDEX "tool_documents_tool_id_idx" ON "tool_documents"("tool_id");

-- CreateIndex
CREATE INDEX "tool_documents_type_idx" ON "tool_documents"("type");

-- CreateIndex
CREATE INDEX "tool_conditions_tool_id_idx" ON "tool_conditions"("tool_id");

-- CreateIndex
CREATE INDEX "tool_conditions_created_at_idx" ON "tool_conditions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "condition_attachments_condition_id_idx" ON "condition_attachments"("condition_id");

-- CreateIndex
CREATE INDEX "rentals_user_id_idx" ON "rentals"("user_id");

-- CreateIndex
CREATE INDEX "rentals_tool_id_idx" ON "rentals"("tool_id");

-- CreateIndex
CREATE INDEX "rentals_status_idx" ON "rentals"("status");

-- CreateIndex
CREATE INDEX "rentals_start_date_end_date_idx" ON "rentals"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "rental_history_rental_id_idx" ON "rental_history"("rental_id");

-- CreateIndex
CREATE INDEX "rental_history_created_at_idx" ON "rental_history"("created_at" DESC);

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");
