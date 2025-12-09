import { ResponsiveDialog } from '@/components/responsive-dialog';
import React from 'react'
import CategoryForm from './category-form';
interface Props{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const NewCategoryDialog = ({open,onOpenChange}:Props) => {
  return (
     <ResponsiveDialog
          title="New Category"
          description="Create a new category"
          open={open}
          onOpenChange={onOpenChange}
        >
            <CategoryForm 
            onSuccess={() => onOpenChange(false)}
             onCancel={() => onOpenChange(false)}
            />
            </ResponsiveDialog>
  )
}

export default NewCategoryDialog
