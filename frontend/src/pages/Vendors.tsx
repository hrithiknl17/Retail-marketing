import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Phone,
  Star,
  Truck,
  Package,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  Plus,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import { api } from '../api';
import type { Delivery, Vendor } from '../types';

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [vendorsData, deliveriesData] = await Promise.all([
          api.getVendors(),
          api.getDeliveries(),
        ]);
        setVendors(vendorsData);
        setDeliveries(deliveriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vendors.');
      }
    };

    load();
  }, []);

  const vendorMap = useMemo(
    () => new Map(vendors.map((vendor) => [vendor.id, vendor])),
    [vendors]
  );

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'delayed':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getStatusIcon = (status: Delivery['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4" />;
      case 'pending':
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 space-y-12 bg-zinc-50 min-h-full">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Truck className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">Active Deliveries</h2>
          </div>
          <span className="px-3 py-1 bg-zinc-200 text-zinc-700 rounded-full text-sm font-medium">
            {deliveries.length} Incoming
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveries.map((delivery) => {
            const vendor = vendorMap.get(delivery.vendorId);
            return (
              <motion.div key={delivery.id} whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(delivery.status)}`}>
                    {getStatusIcon(delivery.status)}
                    {delivery.status}
                  </div>
                  <p className="text-xs font-mono text-zinc-400">ID: #{delivery.id.slice(0, 8)}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{vendor?.name || 'Unknown Vendor'}</h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>Exp. {delivery.expectedDate ? new Date(delivery.expectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center">
                      <Package className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{delivery.items.length} Products</p>
                      <p className="text-xs text-zinc-500">Restocking Inventory</p>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-zinc-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-zinc-100">
                    View Manifest
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {deliveries.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl border border-dashed border-zinc-200 p-10 text-center text-zinc-500">
              No deliveries scheduled yet.
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">Vendor Directory</h2>
          </div>
          <button className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200">
            <Plus className="w-5 h-5" />
            Add New Vendor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {vendors.map((vendor) => (
            <motion.div key={vendor.id} whileHover={{ scale: 1.01 }} className="bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-xl transition-all flex flex-col">
              <div className="h-2 bg-emerald-500 w-full" />

              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-2xl font-bold text-emerald-600 shadow-inner">
                    {vendor.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold border border-amber-100">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {vendor.rating.toFixed(1)}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-extrabold text-zinc-900 mb-1">{vendor.name}</h3>
                  <p className="text-zinc-500 font-medium flex items-center gap-2">
                    {vendor.contactPerson || 'No contact assigned'}
                    <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                    Key Contact
                  </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-zinc-100">
                  <a href={`mailto:${vendor.email}`} className="flex items-center gap-3 text-zinc-600 hover:text-emerald-600 transition-colors group">
                    <div className="p-2 rounded-lg bg-zinc-50 group-hover:bg-emerald-50 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{vendor.email || 'No email'}</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <a href={`tel:${vendor.phone}`} className="flex items-center gap-3 text-zinc-600 hover:text-emerald-600 transition-colors group">
                    <div className="p-2 rounded-lg bg-zinc-50 group-hover:bg-emerald-50 transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{vendor.phone || 'No phone'}</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>

              <div className="p-6 bg-zinc-50 border-t border-zinc-100 mt-auto">
                <button className="w-full bg-white border border-zinc-200 text-zinc-800 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 px-4 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm">
                  <ShoppingBag className="w-5 h-5" />
                  Create Purchase Order
                </button>
              </div>
            </motion.div>
          ))}

          {vendors.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl border border-dashed border-zinc-200 p-10 text-center text-zinc-500">
              No vendors found.
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
