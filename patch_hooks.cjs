const fs = require('fs');

function patchHook(filePath, tableName) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Basic replacement approach to avoid huge regexes
  // We'll search for the specific insert blocks
  
  if (tableName === 'workspaces') {
    const oldBlock = \const { data, error: insertError } = await supabase
        .from('workspaces')
        .insert(insertData)
        .select(\\\
          *,
          hackathon:hackathons (
            id,
            title,
            description,
            start_date,
            end_date,
            location,
            mode,
            image_url
          )
        \\\)
        .single();\;
        
    const newBlock = \const session = await supabase.auth.getSession();
      const res = await fetch('/api/resources/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \\\Bearer \\\\
        },
        body: JSON.stringify({
          table: 'workspaces',
          payload: insertData,
          selectQuery: '*, hackathon:hackathons(id, title, description, start_date, end_date, location, mode, image_url)'
        })
      });
      
      let insertError = null;
      let data = null;
      if (!res.ok) {
        insertError = await res.json();
      } else {
        data = await res.json();
      }\;
      
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync(filePath, content);
    console.log('Patched workspaces');
  }
}

patchHook('src/hooks/useWorkspaces.ts', 'workspaces');
