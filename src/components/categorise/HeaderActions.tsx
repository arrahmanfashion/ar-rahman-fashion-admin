"use client";

import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

import Link from "next/link";

interface HeaderActionsProps {
  onRefresh?: () => void;
}

export default function HeaderActions({ onRefresh }: HeaderActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {onRefresh && (
          <Button 
            onClick={onRefresh}
            variant="outline" 
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        )}
        <Link href={'/admin/add-new-product'}>
          <Button className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>
    </div>
  );
}
