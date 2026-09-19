import { useState, useRef } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon, KeyIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile, generateApiKey, deleteApiKey } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  const hasApiKey = !!authUser?.apiKey;

  const fileInputRef = useRef(null);

  const handleGenerateApiKey = async () => {
    if (hasApiKey) {
      const confirm = window.confirm("Generating a new API Key will invalidate your old one. Are you sure?");
      if (!confirm) return;
    }
    
    const key = await generateApiKey();
    if (key) setApiKey(key);
  };

  const handleDeleteKey = async () => {
    const confirm = window.confirm("Are you sure you want to revoke your API Key? External agents will immediately lose access.");
    if (confirm) {
      await deleteApiKey();
      setApiKey(null);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    // ✅ Reduced padding on mobile
    <div className="p-3 sm:p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AVATAR */}
          <div className="avatar online">
            {/* ✅ Slightly smaller avatar on mobile */}
            <button
              className="size-10 sm:size-14 rounded-full overflow-hidden relative group"
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="User image"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">Change</span>
              </div>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
            {/* ✅ Smaller text + tighter truncate on mobile */}
            <h3 className="text-slate-200 font-medium text-sm sm:text-base max-w-[120px] sm:max-w-[180px] truncate">
              {authUser.fullName}
            </h3>
            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        {/* BUTTONS */}
        {/* ✅ Tighter gap on mobile */}
        <div className="flex gap-2 sm:gap-4 items-center">
          <button
            className={`text-slate-400 hover:text-primary transition-colors ${showApiKeyManager ? 'text-primary' : ''}`}
            title="Manage API Key"
            onClick={() => setShowApiKeyManager(!showApiKeyManager)}
          >
            <KeyIcon className="size-4 sm:size-5" />
          </button>

          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={logout}
          >
            <LogOutIcon className="size-4 sm:size-5" />
          </button>

          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-4 sm:size-5" />
            ) : (
              <VolumeOffIcon className="size-4 sm:size-5" />
            )}
          </button>
        </div>
      </div>

      {showApiKeyManager && (
        <div className="mt-4 p-4 bg-slate-800/80 rounded-lg border border-slate-700 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 className="text-slate-200 font-medium mb-3">API Key Management</h4>
          
          {hasApiKey ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-slate-400 text-xs sm:text-sm">You have an active API Key. For security, it cannot be shown again.</p>
              <div className="flex gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded transition-colors text-xs" onClick={handleGenerateApiKey}>
                  Regenerate
                </button>
                <button className="flex-1 sm:flex-none px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors text-xs" onClick={handleDeleteKey}>
                  Revoke Key
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-slate-400 text-xs sm:text-sm">Generate an API key to allow external AI agents to securely connect to your account.</p>
              <button className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm font-medium whitespace-nowrap" onClick={handleGenerateApiKey}>
                Generate Key
              </button>
            </div>
          )}
          
          {apiKey && (
            <div className="mt-4 p-3 bg-slate-900 rounded border border-primary/30">
              <p className="text-slate-300 mb-2 font-medium">Your new API Key (copy it now, it won't be shown again):</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <code className="bg-black/40 p-2 rounded flex-1 text-primary break-all select-all">{apiKey}</code>
                <button 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    toast.success("Copied to clipboard!");
                    setApiKey(null);
                  }}
                >
                  Copy & Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default ProfileHeader;