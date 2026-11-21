// Generates src/types/database.ts from a columns.json export of information_schema.columns.
// Preferred in real use: `supabase gen types typescript --local > src/types/database.generated.ts`
// This script exists so types can be produced where the Supabase CLI/Docker is unavailable.
import fs from 'node:fs';
const cols = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const map = (u) => {
  if (['uuid','text','varchar','bpchar','date','timestamptz','timestamp','time','citext','name'].includes(u)) return 'string';
  if (['int2','int4','int8','numeric','float4','float8'].includes(u)) return 'number';
  if (u === 'bool') return 'boolean';
  if (['json','jsonb'].includes(u)) return 'Json';
  if (u.startsWith('_')) return map(u.slice(1)) + '[]';
  return 'string';
};
const t = {};
for (const c of cols) (t[c.table_name] ??= []).push(c);
let out = `// AUTO-GENERATED from the migrations in supabase/migrations (74 tables). Do not edit by hand.\n// Row types describe table columns. Some columns (cost fields, invitation tokens) are NOT selectable\n// by the browser role - see docs/FRONTEND_NOTES.md. Always use explicit column lists.\n\nexport type Json = string | number | boolean | null | { [k: string]: Json } | Json[];\n\n`;
for (const [name, cs] of Object.entries(t)) {
  const pascal = name.split('_').map((s) => s[0].toUpperCase() + s.slice(1)).join('');
  out += `export interface ${pascal}Row {\n` + cs.map((c) => `  ${c.column_name}: ${map(c.udt_name)}${c.is_nullable === 'YES' ? ' | null' : ''};`).join('\n') + '\n}\n\n';
}
out += `export interface Database {\n  public: {\n    Tables: {\n` + Object.keys(t).map((n) => { const p = n.split('_').map((s) => s[0].toUpperCase() + s.slice(1)).join(''); return `      ${n}: { Row: ${p}Row; Insert: Partial<${p}Row>; Update: Partial<${p}Row>; Relationships: [] };`; }).join('\n') + `\n    };\n    Views: { [_ in never]: never };\n    Functions: { [_ in never]: never };\n  };\n}\n`;
fs.writeFileSync(process.argv[3], out);
console.log('tables:', Object.keys(t).length);
