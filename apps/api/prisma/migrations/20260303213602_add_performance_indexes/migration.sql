-- CreateIndex
CREATE INDEX "categories_restaurantId_isActive_idx" ON "categories"("restaurantId", "isActive");

-- CreateIndex
CREATE INDEX "menu_items_restaurantId_isAvailable_idx" ON "menu_items"("restaurantId", "isAvailable");

-- CreateIndex
CREATE INDEX "menu_items_categoryId_idx" ON "menu_items"("categoryId");

-- CreateIndex
CREATE INDEX "orders_restaurantId_createdAt_idx" ON "orders"("restaurantId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "orders_restaurantId_status_idx" ON "orders"("restaurantId", "status");

-- CreateIndex
CREATE INDEX "orders_customerPhone_idx" ON "orders"("customerPhone");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "table_sessions_tableId_isActive_idx" ON "table_sessions"("tableId", "isActive");

-- CreateIndex
CREATE INDEX "table_sessions_expiresAt_idx" ON "table_sessions"("expiresAt");
