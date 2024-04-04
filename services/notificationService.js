

// https://supabase.com/docs/guides/realtime/postgres-changes

/* const changes = client
  .channel('table-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tasks',
    },
    (payload) => console.log(payload)
  )
  .subscribe()


  /* const changes = client
  .channel('table-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tasks',
    },
    (payload) {
      const eventType = payload.eventType
      const newRecord = payload.newRecord
      const oldRecord = payload.oldRecord
    }
  )
  .subscribe()
 */