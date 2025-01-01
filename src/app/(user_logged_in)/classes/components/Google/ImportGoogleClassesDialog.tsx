"use client";

import React, { Suspense } from "react";
import GoogleButton from "~/components/third-party-brands/Google/GoogleButton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

const GoogleClassList = React.lazy(() => import("./GoogleClassList"));

export default function ImportGoogleClassesDialog() {
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex items-center space-x-2">
            <GoogleButton text="Import Google Classroom" />
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import classes from Google Classroom</DialogTitle>
            <DialogDescription>
              Add any of the below classes to Reparper.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            {/* <GoogleClassList /> */}
            <Suspense fallback={<div>Loading Google Classroom classes...</div>}>
              <GoogleClassList />
            </Suspense>
          </div>
          <div className="flex items-center space-x-2"></div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <DialogFooter>
              <Button type="button">Import selected classes</Button>
            </DialogFooter>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
