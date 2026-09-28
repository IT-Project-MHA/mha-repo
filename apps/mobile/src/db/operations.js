import { getDb } from './schema';

/* Instruction:
Call the function for the relevant table in the format operateAndSyncTableName with operation
values from {'create', 'update', 'delete'}, followed by an object of attribute values. 

For each table the required (NN: not null) & optional object attributes for each operation 
are listed. */

/* User:
- create: id NN, phone_number NN, display_name NN, email
- update: id NN, phone_number NN, display_name NN, email
- delete: id NN */
export async function operateAndSyncUser(operation, values) {
    const db = getDb();
    const now = Date.now();

    // apply operation to local
    if (operation == 'create') {
        await db.runAsync(`INSERT INTO User (id, phone_number, display_name, email, 
            created_at, updated_at, is_synced) VALUES (?, ?, ?, ?, ?, ?, 0)`, 
            [values.id, values.phone_number, values.display_name, values.email ?? null, 
                now, now]
            )
    } else if (operation == 'update') {
        await db.runAsync(`UPDATE User SET phone_number = ?, display_name = ?, email = ?, 
            updated_at = ?, is_synced = 0 WHERE id = ?`,
        [values.phone_number, values.display_name, values.email ?? null, now, values.id]
    )
    } else if (operation == 'delete') { // soft delete
        await db.runAsync(`UPDATE User SET deleted_at = ?, updated_at = ?, is_synced = 0
            WHERE id = ?`,
            [now, now, values.id]
        )
    }

    // queue operation to remote

}