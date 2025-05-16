import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { FileText, Folder, Clock } from 'lucide-react';
import { Card } from '../UI/Card';

interface StatsData {
  totalDocuments: number;
  totalGroups: number;
  activeJobs: number;
  processingStats: {
    today: number;
    week: number;
    month: number;
  };
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-32 animate-pulse p-6">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="flex items-start">
          <div className="p-3 rounded-full bg-blue-50">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Documents</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {stats.totalDocuments}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {stats.processingStats.today} processed today
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start">
          <div className="p-3 rounded-full bg-green-50">
            <Folder className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Groups</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {stats.totalGroups}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Organize your documents
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start">
          <div className="p-3 rounded-full bg-yellow-50">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Active Jobs</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {stats.activeJobs}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {stats.processingStats.week} processed this week
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}