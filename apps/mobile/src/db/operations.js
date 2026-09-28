import { getDb } from './schema';
import { randomUUID } from 'expo-crypto';

/* Instruction:
Call the function for the relevant table in the format operateAndSyncTableName with operation
values from {'create', 'update', 'delete'}, followed by an object of attribute values.

Use try {...} catch (error) {...} to reapply operation if it failed/

For each table the required (NN: not null) & optional object attributes for each operation 
are listed. */

/* User:
- create: id NN, phone_number NN, display_name NN, email
- update: id NN, server_id, phone_number NN, display_name NN, email
- delete: id NN */
export async function operateAndSyncUser(operation, values) {
    const db = getDb();
    const now = Date.now();

    // roll back operation if it hasn't been applied locally and added to sync queue
    await db.withTransactionAsync(async () => {    

        // apply operation to local
        if (operation == 'create') {
            await db.runAsync(`INSERT INTO User (id, phone_number, display_name, email, 
                created_at, updated_at, is_synced) VALUES (?, ?, ?, ?, ?, ?, 0)`, 
                [values.id, values.phone_number, values.display_name, values.email ?? null, 
                    now, now]
            )
        } else if (operation == 'update') {
            await db.runAsync(`UPDATE User SET server_id = ?, phone_number = ?, display_name = ?, 
                email = ?, updated_at = ?, is_synced = 0 WHERE id = ?`,
                [values.server_id ?? null, values.phone_number, values.display_name, 
                    values.email ?? null, now, values.id]
            )
        } else if (operation == 'delete') { // soft delete
            await db.runAsync(`UPDATE User SET deleted_at = ?, updated_at = ?, is_synced = 0
                WHERE id = ?`,
                [now, now, values.id]
            )
        }

        // queue operation to remote
        await enqueueSync(db, 'User', values.id, operation, values, now);
    })

}

/* Every table operation function adds a record to Outbox. The Outbox table exists locally and is 
a queue of operations to be synced. The status attribute takes Boolean values: 1 for synced, 
0 for not synced. */
async function enqueueSync(db, table, id, operation, values, now) {
    await db.runAsync(`INSERT INTO Outbox (id, entity_type, entity_id, operation, payload, 
        created_at, updated_at, is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [randomUUID(), table, id, operation, JSON.stringify(values), now, now]
    )
}