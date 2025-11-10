"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Check, ImageIcon, Link, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useCreateSettingsMutation,
  useDeleteBannerSliderMutation,
} from "@/redux/featured/settings/settingsApi";

export default function GeneralSettings() {
  const { data: settingsData, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const [createSettings, { isLoading: isCreating }] = useCreateSettingsMutation();
  const [deleteBannerSlider, { isLoading: isDeleting }] = useDeleteBannerSliderMutation();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
  const [bannerUrls, setBannerUrls] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFiles, setBannerFiles] = useState<(File | null)[]>([]);
  const [saved, setSaved] = useState(false);
  const [urlErrors, setUrlErrors] = useState<string[]>([]);

  // ======================
  // URL Validation & Auto-correction
  // ======================
  const isValidDomain = (domain: string): boolean => {
    // More flexible domain validation that supports subdomains
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(([a-zA-Z]{2,})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?(\/.*)?$/;
    
    // Also allow simple domain.tld format
    const simpleDomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}(\/.*)?$/;
    
    return domainRegex.test(domain) || simpleDomainRegex.test(domain);
  };

  const normalizeUrl = (url: string): string => {
    if (!url.trim()) return '';
    
    // If already has protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Validate domain format before adding protocol
    if (!isValidDomain(url)) {
      return url; // Return original if invalid
    }
    
    // Add https:// if no protocol is provided
    return `https://${url}`;
  };

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    
    const trimmedUrl = url.trim();
    
    // Reject obvious invalid patterns
    if (trimmedUrl.includes(' ') || trimmedUrl.includes('///') || 
        trimmedUrl === 'http://' || trimmedUrl === 'https://' ||
        trimmedUrl.length > 2048) {
      return false;
    }
    
    try {
      let testUrl: URL;
      
      if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        testUrl = new URL(trimmedUrl);
      } else {
        testUrl = new URL(`https://${trimmedUrl}`);
      }
      
      const hostname = testUrl.hostname;
      
      if (!hostname || hostname.length === 0 || hostname.length > 253) {
        return false;
      }
      
      const domainParts = hostname.split('.');
      if (domainParts.length < 2) return false;
      
      for (const part of domainParts) {
        if (!part || part.length > 63 || part.startsWith('-') || 
            part.endsWith('-') || !/^[a-zA-Z0-9-]+$/.test(part)) {
          return false;
        }
      }
      
      const tld = domainParts[domainParts.length - 1];
      if (!/^[a-zA-Z]{2,}$/.test(tld)) return false;
      
      return true;
    } catch {
      return false;
    }
  };

  const validateUrls = (): boolean => {
    const errors: string[] = [];
    
    bannerUrls.forEach((url, index) => {
      if (url && !isValidUrl(url)) {
        errors[index] = 'Invalid URL format';
      }
    });
    
    setUrlErrors(errors);
    return errors.length === 0;
  };

  // ======================
  // Load existing settings
  // ======================
  useEffect(() => {
    if (settingsData) {
      setLogoPreview(settingsData.logo || null);
      
      // Handle both old format (string[]) and new format (TSliderImage[])
      if (settingsData.sliderImages) {
        const images: string[] = [];
        const urls: string[] = [];
        
        settingsData.sliderImages.forEach((item: any) => {
          if (typeof item === 'string') {
            // Old format: just image URLs
            images.push(item);
            urls.push("");
          } else if (item && typeof item === 'object') {
            // New format: {image, url}
            images.push(item.image);
            urls.push(item.url || "");
          }
        });
        
        setBannerPreviews(images);
        setBannerUrls(urls);
        setBannerFiles(new Array(images.length).fill(null));
      } else {
        setBannerPreviews([]);
        setBannerUrls([]);
        setBannerFiles([]);
      }
    }
  }, [settingsData]);

  // ======================
  // File size & dimension check
  // ======================
const MAX_LOGO_SIZE = 3 * 1024 * 1024; // 3MB
  const MAX_BANNER_SIZE = 3 * 1024 * 1024; // 3 MB

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "banner",
    index?: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Size validation
    if (type === "logo" && file.size > MAX_LOGO_SIZE) {
      toast.error("Logo file too large! Max allowed size is 500KB.");
      return;
    }
    if (type === "banner" && file.size > MAX_BANNER_SIZE) {
      toast.error("Banner file too large! Max allowed size is 3MB.");
      return;
    }

    // ✅ Banner dimension validation
    if (type === "banner") {
      const img = document.createElement("img");
      img.onload = () => {

        const url = URL.createObjectURL(file);

        if (typeof index === "number") {
          // Replace existing banner at specific index
          const newPreviews = [...bannerPreviews];
          const newFiles = [...bannerFiles];
          
          newPreviews[index] = url;
          newFiles[index] = file;
          
          setBannerPreviews(newPreviews);
          setBannerFiles(newFiles);
        } else if (bannerPreviews.length < 3) {
          // Add new banner
          setBannerPreviews(prev => [...prev, url]);
          setBannerFiles(prev => [...prev, file]);
          setBannerUrls(prev => [...prev, ""]);
        } else {
          toast.error("Maximum 3 banners allowed!");
          return;
        }
        setSaved(false);
      };
      img.src = URL.createObjectURL(file);
      return;
    }

    // ✅ For logo
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    setLogoFile(file);
    setSaved(false);
  };

  // ======================
  // Save settings
  // ======================
  const handleSave = async () => {
    // Validate URLs before saving
    if (!validateUrls()) {
      toast.error('Please fix invalid URLs before saving!');
      return;
    }
    
    try {
      const formData = new FormData();

      if (logoFile) formData.append("logo", logoFile);
      
      // Send new files only
      bannerFiles.forEach((file) => {
        if (file) formData.append("sliderImages", file);
      });
      
      // Send existing banners and URLs for all positions
      bannerPreviews.forEach((preview, index) => {
        if (!bannerFiles[index]) {
          // Keep existing banner
          formData.append(`existingBanner_${index}`, preview);
        } else {
          // New file at this position
          formData.append(`existingBanner_${index}`, "");
        }
        // URL for this position (optional) - normalize before sending
        const normalizedUrl = bannerUrls[index] ? normalizeUrl(bannerUrls[index]) : "";
        formData.append(`sliderImageUrl_${index}`, normalizedUrl);
      });

      const res = settingsData?._id 
        ? await updateSettings(formData).unwrap()
        : await createSettings(formData).unwrap();

      toast.success(res.message || "Settings updated successfully!");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      refetch();
    } catch (err: any) {
      const message =
        err?.data?.message ||
        (err?.message?.includes("File size too large")
          ? "File size too large."
          : "Failed to update settings!");
      toast.error(message);
    }
  };

  // ======================
  // Delete banner
  // ======================
  const handleDeleteBanner = async (index: number) => {
    const imageUrl = bannerPreviews[index];
    
    const result = await Swal.fire({
      title: 'Delete Banner?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await deleteBannerSlider({ imageUrl }).unwrap();
        toast.success('Banner deleted successfully!');
        refetch();
      } catch (err: any) {
        toast.error(err?.data?.message || 'Failed to delete banner!');
      }
    }
  };

  // ======================
  // UI
  // ======================
  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Appearance Settings</h1>
          <p className="text-gray-600 text-lg">
            Manage your website logo and homepage banner images.
          </p>
        </div>

        {/* Website Logo */}
        <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
              Website Logo (Max 500KB)
            </CardTitle>
          </CardHeader>
          <CardContent className="w-xl">
            <div className="relative">
              {logoPreview ? (
                <div className="relative h-60 border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                  <Image
                    src={logoPreview}
                    alt="Logo"
                    fill
                    className="object-contain p-4"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-all flex items-end justify-center pb-3">
                    <label className="cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Replace Logo
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "logo")}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer h-40 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-blue-500 transition-all flex flex-col items-center justify-center gap-3">
                  <Upload className="w-8 h-8 text-blue-500" />
                  <p className="font-semibold text-gray-700">Upload Logo</p>
                  <p className="text-sm text-gray-400">PNG, JPG, SVG up to 3MB</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "logo")}
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Banner Uploads */}
        <Card className="border border-gray-200 shadow-sm rounded-2xl bg-white">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
              Homepage Banner (Max 3, 3MB each, 1920×600 px)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              {bannerPreviews.map((banner, index) => (
                <div key={index} className="space-y-3">
                  <div className="relative h-60 border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                    <Image
                      src={banner}
                      alt={`Banner ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-all flex items-end justify-center pb-4 gap-2">
                      <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Replace
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "banner", index)}
                        />
                      </label>
                      <button
                        onClick={() => handleDeleteBanner(index)}
                        disabled={isDeleting}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      Click URL <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <Input
                      type="url"
                      placeholder="example.com"
                      value={bannerUrls[index] || ""}
                      onChange={(e) => {
                        const newUrls = [...bannerUrls];
                        const newErrors = [...urlErrors];
                        
                        newUrls[index] = e.target.value;
                        
                        // Validate URL in real-time
                        if (e.target.value && !isValidUrl(e.target.value)) {
                          newErrors[index] = 'Invalid URL format';
                        } else {
                          newErrors[index] = '';
                        }
                        
                        setBannerUrls(newUrls);
                        setUrlErrors(newErrors);
                        setSaved(false);
                      }}
                      onBlur={(e) => {
                        // Auto-add https:// when user leaves the field (only if valid domain)
                        if (e.target.value && !e.target.value.startsWith('http')) {
                          const newUrls = [...bannerUrls];
                          const normalizedUrl = normalizeUrl(e.target.value);
                          
                          // Only update if normalization was successful (valid domain)
                          if (normalizedUrl !== e.target.value && isValidUrl(normalizedUrl)) {
                            newUrls[index] = normalizedUrl;
                            setBannerUrls(newUrls);
                          }
                        }
                      }}
                      className={`w-full ${
                        urlErrors[index] ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                    />
                    {urlErrors[index] ? (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <span>⚠️</span>
                        {urlErrors[index]}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-xs mt-1">
                        💡 Example: www.google.com or https://facebook.com/page
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {bannerPreviews.length < 3 && (
                <label className="cursor-pointer h-48 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-blue-500 transition-all flex flex-col items-center justify-center gap-3">
                  <Upload className="w-8 h-8 text-blue-500" />
                  <p className="font-semibold text-gray-700">Add New Banner</p>
                  <p className="text-sm text-gray-400">
                    JPG or PNG — 1920×600 px, up to 3MB
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "banner")}
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving || isCreating}
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-md flex items-center gap-3"
          >
            {(isSaving || isCreating) ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>Save Changes</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
