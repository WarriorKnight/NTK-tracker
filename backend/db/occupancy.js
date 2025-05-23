const db = require('./client');

async function insertOccupancy(count) {
    try {
        const result = await db.query(
            `INSERT INTO occupancy_log (people_count, timestamp) VALUES ($1, CURRENT_TIMESTAMP) RETURNING *`,
            [count]
        );
        console.log("Successfully added log to database.");
        return result.rows[0];
    } catch (error) {
        console.error('Error when inserting log to database:', error.message);
        return null;
    }
}

async function getOccupancyHistory(limit = 50) {
    try {
        const result = await db.query(
            `SELECT id, people_count, timestamp FROM occupancy_log ORDER BY timestamp DESC LIMIT $1`,
            [limit]
        );
        return result.rows.map(row => ({
            ...row,
            timestamp: new Date(row.timestamp).toISOString(),
        }));
    } catch (error) {
        console.error("Failed to fetch occupancy history:", error.message);
        return [];
    }
}



async function dailyAverage(date) {
    try {
        const result = await db.query(
            `SELECT timestamp AS interval_start, people_count AS average_count
             FROM occupancy_log
             WHERE timestamp >= $1::DATE  + INTERVAL '6 hours'
               AND timestamp < ($1::DATE + INTERVAL '1 day')
             ORDER BY timestamp`,
            [date]
        );
        return result.rows;
    } catch (error) {
        console.error("Failed to fetch daily records:", error.message);
        return [];
    }
}


async function highestOccupancy() {
    try {
        const result = await db.query(
            `SELECT id, people_count, timestamp 
             FROM occupancy_log 
             ORDER BY people_count DESC 
             LIMIT 1`
        );
        if (result.rows && result.rows.length > 0) {
            const row = result.rows[0];
            return {
                id: row.id,
                people_count: row.people_count,
                timestamp: new Date(row.timestamp).toISOString()
            };
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch highest occupancy:", error.message);
        return null;
    }
}

async function currentOccupancy() {
    try {
        const result = await db.query(
            `SELECT id, people_count, timestamp 
             FROM occupancy_log 
             ORDER BY timestamp DESC 
             LIMIT 1`
        );
        if (result.rows && result.rows.length > 0) {
            const row = result.rows[0];
            return {
                id: row.id,
                people_count: row.people_count,
                timestamp: new Date(row.timestamp).toISOString()
            };
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch current occupancy:", error.message);
        return null;
    }
}

module.exports = {
    insertOccupancy,
    getOccupancyHistory,
    dailyAverage,
    currentOccupancy,
    highestOccupancy
};

