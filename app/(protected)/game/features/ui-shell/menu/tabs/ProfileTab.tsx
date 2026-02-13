"use client";

import * as React from "react";
import {
  LogOut,
  Settings,
  Save,
  Upload,
  Camera,
  Phone,
  Mail,
} from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePlayer } from "@game/features/player/hooks/use-player";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export function ProfileTab() {
  const { playerInfo } = usePlayer();
  const user = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);

  const { signOut } = useAuthActions();
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  if (!playerInfo) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    try {
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      await updateProfile({ image: storageId });
      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Name cannot be empty");
      return;
    }
    if (trimmedName.length > 20) {
      toast.error("Name cannot exceed 20 characters");
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({ name: trimmedName, phone, email });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const avatarSrc = previewUrl ?? user?.image;
  const isStorageId =
    avatarSrc &&
    !avatarSrc.startsWith("http") &&
    !avatarSrc.startsWith("blob:");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-6 pb-2">
        <div className="relative group">
          <Avatar className="size-24 border-4 border-primary/20 shadow-inner">
            {avatarSrc ? (
              isStorageId ? (
                <AvatarStorageImage storageId={avatarSrc} />
              ) : (
                <AvatarImage
                  src={avatarSrc}
                  alt={user?.name ?? "Avatar"}
                  className="object-cover"
                />
              )
            ) : null}
            <AvatarFallback className="bg-primary/10 text-4xl">
              {(user?.name || playerInfo.name)?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          >
            {isUploading ? (
              <Upload className="size-6 text-white animate-bounce" />
            ) : (
              <Camera className="size-6 text-white" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold tracking-tight">
            {user?.name || playerInfo.name}
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
            <Badge variant="secondary" className="px-2 py-0.5">
              {playerInfo.jobTitle || "Unemployed"}
            </Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="text-destructive hover:bg-destructive/10"
        >
          <LogOut className="size-4 mr-2" />
          Logout
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-5 text-primary" />
              Update Profile
            </CardTitle>
            <CardDescription>
              Change your display name or phone number. Click the avatar above
              to upload a new profile picture.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={20}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                    {name.length}/20
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="size-3.5" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isUpdating}>
                {isUpdating ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AvatarStorageImage({ storageId }: { storageId: string }) {
  const url = useQuery(api.users.getImageUrl, {
    storageId: storageId as Id<"_storage">,
  });

  return <AvatarImage src={url ?? ""} className="object-cover" />;
}
