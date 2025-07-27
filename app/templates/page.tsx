'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Save, Building } from 'lucide-react';
import { Template } from '@/lib/types';
import { getTemplates, saveTemplate, deleteTemplate } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Template>>({});

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const loadedTemplates = getTemplates();
    setTemplates(loadedTemplates);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      companyName: '',
      companyAddress: '',
      companyPhone: '',
      companyEmail: '',
      defaultTerms: 'Payment is due within 30 days of acceptance. All prices are subject to change without notice.',
      defaultNotes: 'Thank you for considering our services. We look forward to working with you.',
      taxRate: 10,
    });
    setEditingTemplate(null);
  };

  const handleEdit = (template: Template) => {
    setFormData(template);
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.companyName || !formData.companyEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields.",
        variant: "destructive",
      });
      return;
    }

    const templateData: Template = {
      id: editingTemplate?.id || crypto.randomUUID(),
      name: formData.name!,
      description: formData.description || '',
      companyName: formData.companyName!,
      companyAddress: formData.companyAddress || '',
      companyPhone: formData.companyPhone || '',
      companyEmail: formData.companyEmail!,
      defaultTerms: formData.defaultTerms || '',
      defaultNotes: formData.defaultNotes || '',
      taxRate: formData.taxRate || 0,
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveTemplate(templateData);
    loadTemplates();
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: `Template ${editingTemplate ? 'updated' : 'created'} successfully!`,
    });
  };

  const handleDelete = (template: Template) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) return;
    
    deleteTemplate(template.id);
    loadTemplates();
    
    toast({
      title: "Success",
      description: "Template deleted successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600">Manage your quotation templates</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Professional Template"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Clean and professional template"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName || ''}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">Company Email *</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={formData.companyEmail || ''}
                      onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                      placeholder="contact@yourcompany.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyPhone">Company Phone</Label>
                    <Input
                      id="companyPhone"
                      value={formData.companyPhone || ''}
                      onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={formData.taxRate || 0}
                      onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={formData.companyAddress || ''}
                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                    placeholder="123 Business Street, City, State 12345"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Default Content</h3>
                <div>
                  <Label htmlFor="defaultNotes">Default Notes</Label>
                  <Textarea
                    id="defaultNotes"
                    value={formData.defaultNotes || ''}
                    onChange={(e) => setFormData({ ...formData, defaultNotes: e.target.value })}
                    placeholder="Thank you for considering our services..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultTerms">Default Terms & Conditions</Label>
                  <Textarea
                    id="defaultTerms"
                    value={formData.defaultTerms || ''}
                    onChange={(e) => setFormData({ ...formData, defaultTerms: e.target.value })}
                    placeholder="Payment is due within 30 days..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Building className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-4">Create your first template to get started.</p>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.description && (
                      <p className="text-sm text-gray-600">{template.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(template)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">Company</h4>
                    <p className="font-medium">{template.companyName}</p>
                    {template.companyAddress && (
                      <p className="text-sm text-gray-600">{template.companyAddress}</p>
                    )}
                    <p className="text-sm text-gray-600">{template.companyEmail}</p>
                    {template.companyPhone && (
                      <p className="text-sm text-gray-600">{template.companyPhone}</p>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Default Tax Rate:</span>
                    <span>{template.taxRate}%</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}