import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { useFinance, Category } from '@/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/layout/Layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import * as LucideIcons from 'lucide-react';

const availableIcons = [
  'Briefcase', 'Laptop', 'Utensils', 'Car', 'ShoppingBag', 'Home', 'Zap', 
  'Film', 'Heart', 'TrendingUp', 'Gift', 'Coffee', 'Plane', 'Book', 'Music',
  'Gamepad2', 'Dumbbell', 'Pill', 'Baby', 'Dog', 'Shirt', 'Scissors', 'Wrench'
];

const availableColors = [
  '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444', 
  '#6366F1', '#14B8A6', '#F43F5E', '#22C55E', '#0EA5E9', '#A855F7'
];

export default function Categories() {
  const { state, dispatch } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [deletingCategory, setDeletingCategory] = useState<Category | undefined>();
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Tag',
    color: '#10B981',
    type: 'expense' as 'income' | 'expense' | 'both',
  });

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
      });
    } else {
      setEditingCategory(undefined);
      setFormData({
        name: '',
        icon: 'Tag',
        color: '#10B981',
        type: 'expense',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      dispatch({
        type: 'UPDATE_CATEGORY',
        payload: { ...editingCategory, ...formData },
      });
    } else {
      const newCategory: Category = {
        id: crypto.randomUUID(),
        ...formData,
      };
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
    }
    
    setShowModal(false);
    setEditingCategory(undefined);
  };

  const handleDelete = () => {
    if (deletingCategory) {
      dispatch({ type: 'DELETE_CATEGORY', payload: deletingCategory.id });
      setDeletingCategory(undefined);
    }
  };

  const incomeCategories = state.categories.filter(c => c.type === 'income' || c.type === 'both');
  const expenseCategories = state.categories.filter(c => c.type === 'expense' || c.type === 'both');

  const renderIcon = (iconName: string, color: string) => {
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>;
    const IconComponent = icons[iconName] || LucideIcons.Tag;
    return <IconComponent className="w-5 h-5" style={{ color }} />;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Categories</h1>
            <p className="text-muted-foreground mt-1">
              Manage your income and expense categories
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="gap-2 rounded-xl shadow-glow"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>

        {/* Income Categories */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-income" />
            Income Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card p-4 rounded-2xl hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {renderIcon(category.icon, category.color)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{category.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{category.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(category)}
                        className="rounded-lg hover:bg-muted"
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCategory(category)}
                        className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-expense" />
            Expense Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card p-4 rounded-2xl hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {renderIcon(category.icon, category.color)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{category.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{category.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(category)}
                        className="rounded-lg hover:bg-muted"
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCategory(category)}
                        className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="e.g., Groceries"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'income' | 'expense' | 'both') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-8 gap-2 p-3 bg-muted/50 rounded-xl max-h-[120px] overflow-y-auto">
                {availableIcons.map((iconName) => {
                  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
                  const IconComponent = icons[iconName] || LucideIcons.Tag;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: iconName })}
                      className={`p-2 rounded-lg transition-all ${
                        formData.icon === iconName
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap p-3 bg-muted/50 rounded-xl">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-xl shadow-glow">
                {editingCategory ? 'Save Changes' : 'Add Category'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(undefined)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"? Transactions using this category will keep their category name.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}