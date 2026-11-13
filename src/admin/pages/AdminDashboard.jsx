import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ap } from '../adminPath';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Inbox,
  Package,
  Layers,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import SeoHead from '../../components/SeoHead';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDashboard();
      setData(res);
    } catch (_) {
      // handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const metrics = data?.metrics || {
    totalEnquiries: 0,
    newEnquiries: 0,
    inProgressEnquiries: 0,
    respondedEnquiries: 0,
    closedEnquiries: 0,
    publishedProducts: 0,
    draftProducts: 0,
    activeDivisions: 0,
  };

  const kpiCards = [
    {
      label: 'Total Enquiries',
      value: metrics.totalEnquiries,
      sub: `${metrics.newEnquiries} new awaiting review`,
      Icon: Inbox,
      link: ap('/admin/enquiries'),
    },
    {
      label: 'New Enquiries',
      value: metrics.newEnquiries,
      sub: `${metrics.inProgressEnquiries} in progress`,
      Icon: Clock,
      link: ap('/admin/enquiries?status=New'),
    },
    {
      label: 'Published Products',
      value: metrics.publishedProducts,
      sub: `${metrics.draftProducts} draft / pending review`,
      Icon: Package,
      link: ap('/admin/products'),
    },
    {
      label: 'Active Divisions',
      value: metrics.activeDivisions,
      sub: 'Core business verticals',
      Icon: Layers,
      link: ap('/admin/divisions'),
    },
  ];

  return (
    <div className="space-y-8">
      <SeoHead title="Admin Dashboard" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#3F5E8C]/40">
        <div>
          <p className="font-mono-code text-xs uppercase tracking-[0.2em] text-[#D9C08B]">
            Real-Time MongoDB Telemetry
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#F4EEDF] mt-1">
            Executive Dashboard
          </h1>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#16294D] border border-[#D9C08B]/40 text-xs uppercase tracking-widest text-[#F4EEDF] hover:border-[#D9C08B] hover:text-[#D9C08B] cursor-pointer"
        >
          <RefreshCw aria-hidden="true" className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map(({ label, value, sub, Icon, link }) => (
          <Link
            key={label}
            to={link}
            className="bg-[#16294D] border border-[#3F5E8C]/50 hover:border-[#D9C08B] p-6 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-code uppercase tracking-wider text-[#F4EEDF]/75">
                {label}
              </span>
              <Icon aria-hidden="true" className="w-4 h-4 text-[#D9C08B]" />
            </div>
            <div className="my-4">
              <span className="font-display text-4xl font-semibold text-[#F4EEDF]">{value}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#D9C08B]">
              <span>{sub}</span>
              <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Enquiries by Division Chart */}
        <div className="lg:col-span-7 bg-[#16294D] border border-[#3F5E8C]/45 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-mono-code text-xs uppercase tracking-widest text-[#D9C08B]">
                Division Demand
              </p>
              <h2 className="font-display text-2xl font-semibold text-[#F4EEDF]">
                Enquiries by Business Division
              </h2>
            </div>
          </div>

          {data?.enquiriesByDivision && data.enquiriesByDivision.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.enquiriesByDivision}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <XAxis
                    dataKey="division"
                    stroke="#F4EEDF"
                    tick={{ fill: '#F4EEDF', fontSize: 10 }}
                    tickFormatter={(val) => (val && val.length > 12 ? `${val.slice(0, 10)}…` : val)}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="#F4EEDF"
                    tick={{ fill: '#F4EEDF', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A1428',
                      borderColor: '#D9C08B',
                      color: '#F4EEDF',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Enquiries">
                    {data.enquiriesByDivision.map((entry, idx) => (
                      <Cell
                        key={`cell-${entry.division}`}
                        fill={idx % 2 === 0 ? '#D9C08B' : '#3F5E8C'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 bg-[#0A1428] border border-[#3F5E8C]/35 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-sm text-[#F4EEDF]/80">
                No enquiries recorded yet. Once visitors submit enquiries, division distribution
                will appear here automatically.
              </p>
            </div>
          )}
        </div>

        {/* Recent Audit Activity */}
        <div className="lg:col-span-5 bg-[#16294D] border border-[#3F5E8C]/45 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-mono-code text-xs uppercase tracking-widest text-[#D9C08B]">
                  Security &amp; Audit Trail
                </p>
                <h2 className="font-display text-2xl font-semibold text-[#F4EEDF]">
                  Recent Admin Activity
                </h2>
              </div>
              <Activity aria-hidden="true" className="w-4 h-4 text-[#D9C08B]" />
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((log) => (
                  <div
                    key={log._id}
                    className="p-3 bg-[#0A1428] border border-[#3F5E8C]/35 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono-code text-[#D9C08B]">
                      <span>{log.action}</span>
                      <span>
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''}
                      </span>
                    </div>
                    <p className="text-[#F4EEDF]/90">{log.summary}</p>
                    <p className="text-[10px] text-[#F4EEDF]/55">{log.performedBy}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#F4EEDF]/70 py-8 text-center">
                  No administrative operations logged yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Enquiries Table */}
      <div className="bg-[#16294D] border border-[#3F5E8C]/45 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-mono-code text-xs uppercase tracking-widest text-[#D9C08B]">
              Latest Submissions
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#F4EEDF]">
              Recent Customer Enquiries
            </h2>
          </div>
          <Link
            to={ap('/admin/enquiries')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#D9C08B] hover:underline"
          >
            <span>Open Full CRM</span>
            <ArrowUpRight aria-hidden="true" className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#3F5E8C]/40 text-xs font-mono-code uppercase text-[#D9C08B]">
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3">Customer / Company</th>
                <th className="py-3 px-3">Division</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3F5E8C]/30">
              {data?.recentEnquiries && data.recentEnquiries.length > 0 ? (
                data.recentEnquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-[#0A1428]/50">
                    <td className="py-3 px-3 font-mono-code text-xs text-[#D9C08B]">
                      {enq.reference}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-[#F4EEDF]">{enq.fullName}</p>
                      <p className="text-xs text-[#F4EEDF]/65">{enq.companyName}</p>
                    </td>
                    <td className="py-3 px-3 text-xs text-[#F4EEDF]/85">{enq.divisionName}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 text-[11px] font-mono-code uppercase bg-[#0A1428] border border-[#D9C08B]/40 text-[#D9C08B]">
                        {enq.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-[#F4EEDF]/70">
                      {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : ''}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#F4EEDF]/70">
                    No customer enquiries have been submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
