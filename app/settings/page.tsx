'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  Upload, 
  Trash2, 
  Settings as SettingsIcon,
  Database,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { exportData, importData, getQuotations, getTemplates } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dovepeak-quotations-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importData(content);
        
        toast({
          title: "Import Successful",
          description: "Your data has been imported successfully.",
        });
        
        // Refresh the page to show imported data
        window.location.reload();
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid file format or corrupted data.",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
        event.target.value = ''; // Reset file input
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Import Failed",
        description: "Error reading the file.",
        variant: "destructive",
      });
      setIsImporting(false);
      event.target.value = '';
    };
    
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    try {
      localStorage.removeItem('dovepeak_quotations');
      localStorage.removeItem('dovepeak_templates');
      
      toast({
        title: "Data Cleared",
        description: "All data has been cleared successfully.",
      });
      
      // Refresh the page
      window.location.reload();
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "There was an error clearing your data.",
        variant: "destructive",
      });
    }
  };

  const quotationsCount = getQuotations().length;
  const templatesCount = getTemplates().length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your application settings and data</p>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Data Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="font-medium">Quotations</p>
                  <p className="text-2xl font-bold text-blue-600">{quotationsCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <SettingsIcon className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="font-medium">Templates</p>
                  <p className="text-2xl font-bold text-green-600">{templatesCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Export/Import Actions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Backup & Restore</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleExportData} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                
                <div className="flex-1">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    id="import-file"
                    disabled={isImporting}
                  />
                  <label htmlFor="import-file">
                    <Button 
                      variant="outline" 
                      className="w-full cursor-pointer"
                      disabled={isImporting}
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {isImporting ? 'Importing...' : 'Import Data'}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Export your data as a JSON file for backup, or import a previously exported file.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Clear All Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will permanently delete all quotations and templates. This action cannot be undone.
              </p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete:
                      <ul className="list-disc list-inside mt-2">
                        <li>{quotationsCount} quotations</li>
                        <li>{templatesCount} templates</li>
                      </ul>
                      <br />
                      Consider exporting your data first as a backup.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllData} className="bg-red-600 hover:bg-red-700">
                      Yes, clear all data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Info */}
      <Card>
        <CardHeader>
          <CardTitle>Application Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Application Name:</span>
              <span className="font-medium">Dovepeak Quotation Master</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Storage Type:</span>
              <span className="font-medium">Local Storage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Backup:</span>
              <span className="font-medium">
                {localStorage.getItem('dovepeak_last_backup') || 'Never'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">📁 Data Storage</h4>
              <p className="text-sm text-gray-600">
                Your data is stored locally in your browser. Make sure to export your data regularly 
                to avoid losing it when clearing browser data.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📧 Email Integration</h4>
              <p className="text-sm text-gray-600">
                The email feature opens your default email client with pre-filled content. 
                Make sure you have an email client installed and configured.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎨 Templates</h4>
              <p className="text-sm text-gray-600">
                Create multiple templates for different types of services or clients. 
                This will save you time when creating new quotations.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 Analytics</h4>
              <p className="text-sm text-gray-600">
                Visit the Analytics page to get insights into your quotation performance, 
                acceptance rates, and revenue trends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}