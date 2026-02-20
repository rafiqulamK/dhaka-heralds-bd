import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Image, Video, Copy, Check } from 'lucide-react';

export default function AdminMedia() {
  const [media, setMedia] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false });
    setMedia(data || []);
  };

  useEffect(() => { load(); }, []);

  const uploadFile = async (file: File, type: 'image' | 'video') => {
    setUploading(true);
    const bucket = type === 'image' ? 'media-images' : 'media-videos';
    const path = `${user?.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } else {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      await supabase.from('media').insert({ file_name: file.name, file_url: publicUrl, file_type: type, file_size: file.size, bucket_path: path, uploaded_by: user?.id });
      toast({ title: `${type === 'image' ? 'Image' : 'Video'} uploaded!` });
      load();
    }
    setUploading(false);
  };

  const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(f => uploadFile(f, 'image'));
  };

  const handleVidUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(f => uploadFile(f, 'video'));
  };

  const handleDelete = async (item: any) => {
    if (!confirm('Delete this file?')) return;
    const bucket = item.file_type === 'image' ? 'media-images' : 'media-videos';
    await supabase.storage.from(bucket).remove([item.bucket_path]);
    await supabase.from('media').delete().eq('id', item.id);
    load();
    toast({ title: 'File deleted' });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = media.filter(m => filter === 'all' || m.file_type === filter);
  const formatSize = (bytes: number) => bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : '—';

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold gold-text mb-4">Media Library</h1>
        <div className="flex flex-wrap gap-3 items-center">
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); Array.from(e.dataTransfer.files).forEach(f => uploadFile(f, f.type.startsWith('video') ? 'video' : 'image')); }}
            className="flex-1 border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors bg-card"
            onClick={() => imgInputRef.current?.click()}
          >
            <Upload size={24} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-foreground font-medium">Drop files or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">Images (JPEG, PNG, WebP, GIF) or Videos (MP4, MOV, etc.)</p>
            {uploading && <p className="text-xs text-primary mt-2 animate-pulse">Uploading...</p>}
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => imgInputRef.current?.click()} className="gold-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Image size={14} /> Upload Images
            </button>
            <button onClick={() => vidInputRef.current?.click()} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Video size={14} /> Upload Videos
            </button>
          </div>
          <input ref={imgInputRef} type="file" multiple accept="image/*" onChange={handleImgUpload} className="hidden" />
          <input ref={vidInputRef} type="file" multiple accept="video/*" onChange={handleVidUpload} className="hidden" />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'image', 'video'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {f === 'all' ? `All (${media.length})` : `${f}s (${media.filter(m => m.file_type === f).length})`}
          </button>
        ))}
      </div>

      {/* Media grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map(item => (
          <div key={item.id} className="bg-card rounded-lg gold-border overflow-hidden group relative">
            <div className="aspect-square bg-muted relative overflow-hidden">
              {item.file_type === 'image' ? (
                <img src={item.file_url} alt={item.file_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Video size={32} className="text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => copyUrl(item.file_url)} className="p-1.5 bg-card rounded text-foreground hover:text-primary">
                  {copied === item.file_url ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
                <button onClick={() => handleDelete(item)} className="p-1.5 bg-card rounded text-foreground hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-2">
              <p className="text-xs text-foreground truncate" title={item.file_name}>{item.file_name}</p>
              <p className="text-xs text-muted-foreground">{formatSize(item.file_size)}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <Upload size={40} className="mx-auto mb-3 opacity-50" />
            <p>No media files yet. Start uploading!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
