const LoadingScreen = () => (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
            <div className="size-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <span className="font-mono text-sm font-medium text-muted-foreground">
                Loading...
            </span>
        </div>
    </div>
);

export default LoadingScreen;
