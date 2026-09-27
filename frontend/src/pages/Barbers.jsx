import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Scissors } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import Badge from '../components/Badge';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';

const Barbers = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const response = await api.get('/barbers');
      setBarbers(response.data);
    } catch (error) {
      toast.error('Gagal memuat data barber');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-secondary-900">Daftar Barber</h2>
        <p className="text-sm text-secondary-500">Lihat profil dan informasi barber</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {barbers.map((barber) => (
          <Card key={barber.id} className={barber.status === 'inactive' ? 'opacity-60' : ''}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Scissors className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary-900">{barber.name}</h3>
                  <Badge variant={barber.status === 'active' ? 'success' : 'secondary'} className="mt-1">
                    {barber.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-secondary-600">
                  <Mail className="h-4 w-4" />
                  <span>{barber.email}</span>
                </div>
                {barber.phone && (
                  <div className="flex items-center gap-2 text-secondary-600">
                    <Phone className="h-4 w-4" />
                    <span>{barber.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-700">
                  <span className="font-medium">Komisi:</span> {barber.commission_rate}% | 
                  <span className="font-medium"> Gaji Pokok:</span> {formatCurrency(barber.salary)}
                </div>
              </div>

              {barber.specialties?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-secondary-500 mb-2">Spesialisasi:</p>
                  <div className="flex flex-wrap gap-1">
                    {barber.specialties.map((spec, idx) => (
                      <span key={idx} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {barber.bio && (
                <p className="mt-3 text-sm text-secondary-500 italic">
                  "{barber.bio}"
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Barbers;
