'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, Building, Star } from 'lucide-react';
import { BusinessProfile } from '@/lib/types';
import { getBusinessProfiles, saveBusinessProfile, deleteBusinessProfile } from '@/lib/storage';
import { CURRENCIES } from '@/lib/currencies';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function BusinessProfilesPage() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState<BusinessProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<BusinessProfile>>({});

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    const loadedProfiles = getBusinessProfiles();
    setProfiles(loadedProfiles);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      companyName: '',
      companyAddress: '',
      companyPhone: '',
      companyEmail: '',
      companyWebsite: '',
      taxId: '',
      registrationNumber: '',
      bankDetails: {
        bankName: '',
        accountName: '',
        accountNumber: '',
        routingNumber: '',
        swiftCode: '',
      },
      defaultCurrency: 'USD',
      defaultTaxRate: 10,
      isDefault: false,
    });
    setEditingProfile(null);
  };

  const handleEdit = (profile: BusinessProfile) => {
    setFormData(profile);
    setEditingProfile(profile);
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

    const profileData: BusinessProfile = {
      id: editingProfile?.id || crypto.randomUUID(),
      name: formData.name!,
      companyName: formData.companyName!,
      companyAddress: formData.companyAddress || '',
      companyPhone: formData.companyPhone || '',
      companyEmail: formData.companyEmail!,
      companyWebsite: formData.companyWebsite || '',
      taxId: formData.taxId || '',
      registrationNumber: formData.registrationNumber || '',
      bankDetails: formData.bankDetails || {
        bankName: '',
        accountName: '',
        accountNumber: '',
        routingNumber: '',
        swiftCode: '',
      },
      defaultCurrency: formData.defaultCurrency || 'USD',
      defaultTaxRate: formData.defaultTaxRate || 10,
      isDefault: formData.isDefault || false,
      createdAt: editingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveBusinessProfile(profileData);
    loadProfiles();
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: `Business profile ${editingProfile ? 'updated' : 'created'} successfully!`,
    });
  };

  const handleDelete = (profile: BusinessProfile) => {
    if (profile.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the default business profile. Set another profile as default first.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete "${profile.name}"?`)) return;
    
    deleteBusinessProfile(profile.id);
    loadProfiles();
    
    toast({
      title: "Success",
      description: "Business profile deleted successfully",
    });
  };

  const handleSetDefault = (profile: BusinessProfile) => {
    const updatedProfile = { ...profile, isDefault: true };
    saveBusinessProfile(updatedProfile);
    loadProfiles();
    
    toast({
      title: "Success",
      description: `"${profile.name}" is now the default business profile`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Profiles</h1>
          <p className="text-gray-600">Manage your business information for quotations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? 'Edit Business Profile' : 'Create New Business Profile'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Profile Name *</Label>
                    <Input
                      id="name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Main Business"
                    />
                  </div>
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
                    <Label htmlFor="companyWebsite">Website</Label>
                    <Input
                      id="companyWebsite"
                      value={formData.companyWebsite || ''}
                      onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                      placeholder="www.yourcompany.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId || ''}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      placeholder="TAX123456789"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={formData.companyAddress || ''}
                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                    placeholder="123 Business Street&#10;City, State 12345&#10;Country"
                    rows={4}
                  />
                </div>
              </div>

              {/* Financial Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Financial Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Select 
                      value={formData.defaultCurrency || 'USD'} 
                      onValueChange={(value) => setFormData({ ...formData, defaultCurrency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.name} ({currency.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                    <Input
                      id="defaultTaxRate"
                      type="number"
                      value={formData.defaultTaxRate || 0}
                      onChange={(e) => setFormData({ ...formData, defaultTaxRate: Number(e.target.value) })}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Banking Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Banking Details (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankDetails?.bankName || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        bankDetails: { ...formData.bankDetails, bankName: e.target.value } as any
                      })}
                      placeholder="Your Bank Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      value={formData.bankDetails?.accountName || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        bankDetails: { ...formData.bankDetails, accountName: e.target.value } as any
                      })}
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={formData.bankDetails?.accountNumber || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } as any
                      })}
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      value={formData.bankDetails?.routingNumber || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        bankDetails: { ...formData.bankDetails, routingNumber: e.target.value } as any
                      })}
                      placeholder="123456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="swiftCode">SWIFT Code</Label>
                    <Input
                      id="swiftCode"
                      value={formData.bankDetails?.swiftCode || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        bankDetails: { ...formData.bankDetails, swiftCode: e.target.value } as any
                      })}
                      placeholder="BANKCODE"
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Settings</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={formData.isDefault || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                  />
                  <Label htmlFor="isDefault">Set as default business profile</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Profiles Grid */}
      {profiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Building className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No business profiles yet</h3>
          <p className="text-gray-600 mb-4">Create your first business profile to get started.</p>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Profile
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow duration-200 relative">
              {profile.isDefault && (
                <div className="absolute top-3 right-3">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {profile.name}
                      {profile.isDefault && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{profile.companyName}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(profile)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    {!profile.isDefault && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(profile)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">{profile.companyAddress}</p>
                    <p className="text-sm text-gray-600">{profile.companyEmail}</p>
                    {profile.companyPhone && (
                      <p className="text-sm text-gray-600">{profile.companyPhone}</p>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Currency:</span>
                    <span>{profile.defaultCurrency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax Rate:</span>
                    <span>{profile.defaultTaxRate}%</span>
                  </div>
                  {!profile.isDefault && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => handleSetDefault(profile)}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Set as Default
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}