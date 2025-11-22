import React, { useEffect, useState } from 'react';

const EMPTY_PROMPTS = {
  categorization: '',
  action_item: '',
  auto_reply: ''
};

export default function PromptEditor({ prompts, saving, onSave }) {
  const [local, setLocal] = useState(prompts || EMPTY_PROMPTS);

  useEffect(() => {
    setLocal(prompts || EMPTY_PROMPTS);
  }, [prompts]);

  return (
    <div>
      <div>
        <label>Categorization Prompt</label>
        <textarea value={local.categorization} onChange={e=>setLocal({...local, categorization:e.target.value})} style={{width:'100%',height:80}} />
      </div>
      <div>
        <label>Action Item Prompt</label>
        <textarea value={local.action_item} onChange={e=>setLocal({...local, action_item:e.target.value})} style={{width:'100%',height:80}} />
      </div>
      <div>
        <label>Auto-Reply Prompt</label>
        <textarea value={local.auto_reply} onChange={e=>setLocal({...local, auto_reply:e.target.value})} style={{width:'100%',height:80}} />
      </div>
      <div style={{marginTop:8}}>
        <button onClick={()=>onSave(local)} disabled={saving}>
          {saving ? 'Saving…' : 'Save prompts'}
        </button>
      </div>
    </div>
  );
}
