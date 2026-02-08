## TODO Plan: In-World Shop System (Remove Global Shop)

Replace the global Shop tab in the GameMenu with physical in-world shop interactions. Players click on shop buildings to open a type-specific shop dialog. Server validates proximity before allowing purchases.

**Steps**

1. **Remove Shop from GameMenu** — In GameMenu.tsx/game/components/ui/menu/GameMenu.tsx), remove the `shop` entry from `NAV_ITEMS`, remove the `ShopTab` import, remove the `open_shop` keyboard binding, and remove the `{activeNav === "shop" && <ShopTab />}` render block. Update the `NavId` type accordingly.

2. **Remove `open_shop` keybinding** — In use-keyboard.ts/game/hooks/use-keyboard.ts), remove the `open_shop` entry from `CONTROL_MAP`.

3. **Delete or repurpose ShopTab** — Delete ShopTab.tsx/game/components/ui/menu/ShopTab.tsx). Its food-buying UI will be rebuilt inside the new shop dialog.

4. **Create `ShopDialog.tsx`** — New file at `app/(protected)/game/components/ui/ShopDialog.tsx`. A full `Dialog` (matching the GameMenu style) that receives a shop property (with `subType`) and renders:
   - **`food_shop`**: Food items grid using `FOOD_LIST` from `foodConfig.ts`, buy buttons via `useFood().buyFood()`.
   - **`supply_store`**: Supply items (placeholder for now — "Coming soon").
   - **`clothing_store`**: Clothing items (placeholder for now — "Coming soon").
   - A header showing the shop name, zone, and a "Property" tab to view/buy the building itself (reusing `PropertyDialog` logic).
   - Close on Escape or clicking outside.

5. **Modify building click handler in GameCanvas** — In GameCanvas.tsx/game/components/viewport/GameCanvas.tsx), update `handlePropertyClick`:
   - If the clicked property has `category === "shop"`, check proximity (same `CLIENT_INTERACT_RADIUS` or a slightly larger radius like 60–80 for shops). If within range, open `ShopDialog` instead of `PropertyDialog`. If out of range, show a toast like "Walk closer to enter this shop."
   - All other categories continue opening `PropertyDialog` as before.
   - Add state: `selectedShop` and `shopDialogOpen`.

6. **Add server-side proximity check to `buyFood`** — In food.ts, modify the `buyFood` mutation:
   - Add an optional `shopPropertyId` argument (ID of the shop building being purchased from).
   - Query the shop property's `(x, y)` and the player's `(x, y)`, compute distance, reject if `> SHOP_INTERACT_RADIUS` (e.g., 80).
   - This ensures the player is physically near the shop.

7. **Update `useFood` hook** — In use-food.ts/game/hooks/use-food.ts), update `buyFood` to accept and forward the `shopPropertyId` to the mutation.

8. **Add shop proximity constant** — In gameConstants.ts, add `SHOP_INTERACT_RADIUS = 80` (shared between client and server).

9. **Visual shop indicator on PropertyNode** — Optionally, in PropertyNode.tsx/game/components/viewport/world/PropertyNode.tsx), add a small shop icon/emoji overlay or distinct cursor (`cursor="pointer"` with a shop icon) for `category === "shop"` buildings so players can visually identify them.

10. **Update README** — In README.md, update the Shop section to reflect proximity-based purchasing and remove mention of the global Shop tab. Remove `B` shortcut from the controls table.

**Verification**

- Start the dev server, open the game menu — Shop tab should be gone, `B` key should do nothing.
- Walk to a food shop building, click it — `ShopDialog` opens with food items.
- Click a food shop from far away — toast "Walk closer to enter this shop."
- Buy food from the shop dialog — server validates proximity, purchase succeeds.
- Try buying food via direct API call without being near a shop — server rejects.
- Click a non-shop building — `PropertyDialog` opens as before.
- Supply store and clothing store — show "Coming soon" placeholder.

**Decisions**

- Click-to-open (not F-key proximity prompt) chosen for shop interaction.
- Server-side proximity validation on every purchase.
- Type-specific shops: each building only sells its category of items.
- Shop dialog also includes an option to buy/view the property itself (so players don't lose access to the property transaction UI for shop buildings).
