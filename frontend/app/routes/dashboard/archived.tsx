import { NoDataFound } from "@/components/no-data-found";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

const Archived = () => {
    const [search, setSearch] = useState("");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Archived Items</h1>
                    <p className="text-muted-foreground">
                        View all your archived projects, tasks, and workspaces here.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Archive Management</CardTitle>
                    <CardDescription>
                        Items that have been marked as archived are kept here and can be restored.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input 
                            type="text" 
                            placeholder="Search archives..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button type="submit" variant="secondary">
                            <Search className="size-4 mr-2" />
                            Search
                        </Button>
                    </div>

                    <div className="mt-8 rounded-md border p-8">
                        <NoDataFound 
                            title="No Archived Items" 
                            description="You haven't archived anything yet. Items you archive will appear here."
                            buttonText="Go back to Dashboard"
                            buttonAction={() => window.history.back()}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Archived;
