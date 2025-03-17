const extractFilePathFromUrl = (url: string) => {
    const parts = url.split('https://ogleiayxufndnwooxnfn.supabase.co/storage/v1/object/public/post_image/');
    return parts.length > 1 ? decodeURIComponent(parts[1]) : '';
};

export { extractFilePathFromUrl };

