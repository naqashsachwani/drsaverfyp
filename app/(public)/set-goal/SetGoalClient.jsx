'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function SetGoalClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("productId") || "";

  const [product, setProduct] = useState(null);
  const [targetAmount, setTargetAmount] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // new state for success message

  const periodOptions = [
    { value: "2", label: "2 Months" },
    { value: "3", label: "3 Months" },
    { value: "6", label: "6 Months" },
    { value: "12", label: "12 Months" }
  ];

  const calculateTargetDate = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() + parseInt(months));
    return date.toISOString().split('T')[0];
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (period) setTargetDate(calculateTargetDate(period));
    else setTargetDate("");
  };

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);

    const fetchProduct = fetch(`/api/products/${encodeURIComponent(productId)}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data.product);
        if (data.product?.price) setTargetAmount(String(data.product.price));
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      });

    const fetchGoals = fetch("/api/set-goal")
      .then(res => res.json())
      .then(data => {
        const existingGoal = data.goals?.find(goal => goal.productId === productId);
        if (existingGoal) {
          setTargetAmount(String(existingGoal.targetAmount));
          setTargetDate(existingGoal.endDate ? existingGoal.endDate.split("T")[0] : "");
          if (existingGoal.endDate) {
            const monthsDiff = Math.round((new Date(existingGoal.endDate) - new Date()) / (1000 * 60 * 60 * 24 * 30));
            const closest = periodOptions.reduce((prev, curr) =>
              Math.abs(parseInt(curr.value) - monthsDiff) < Math.abs(parseInt(prev.value) - monthsDiff) ? curr : prev
            );
            setSelectedPeriod(closest.value);
          }
        }
      })
      .catch(err => console.error(err));

    Promise.all([fetchProduct, fetchGoals]).finally(() => setLoading(false));
  }, [productId]);

  const onSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!targetAmount || Number(targetAmount) <= 0) return setError("Enter valid target amount");
    if (!selectedPeriod) return setError("Select a target period");

    setSaving(true);
    try {
      const res = await fetch("/api/set-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, targetAmount: Number(targetAmount), targetDate })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save goal");

      // show success message instead of redirect
      setSuccess("Goal saved successfully!");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!productId) return <p>No product selected. Use ?productId=PRODUCT_ID</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Set a savings goal for this product</h2>

      {loading ? <p>Loading...</p> : (
        <>
          <div className="mb-6 p-4 border rounded-lg bg-slate-50 flex gap-4 items-center">
            {product?.images?.[0] ? (
              <Image src={product.images[0]} width={96} height={96} alt={product.name} className="object-cover rounded" />
            ) : <div className="w-24 h-24 bg-slate-100 flex items-center justify-center">No image</div>}

            <div>
              <div className="text-lg font-semibold">{product?.name}</div>
              <div>Price: {process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'Rs'}{product?.price}</div>
            </div>
          </div>

          <form onSubmit={onSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium">Target Amount</label>
              <div className="p-2 bg-slate-100 rounded">{process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'Rs'}{targetAmount}</div>
            </div>

            <div>
              <label className="block text-sm font-medium">Select Target Period</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {periodOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handlePeriodChange(opt.value)}
                    className={`p-3 border rounded ${selectedPeriod === opt.value ? 'bg-slate-800 text-white' : 'bg-white hover:bg-slate-50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {targetDate && <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              Target Date: {new Date(targetDate).toLocaleDateString()}
            </div>}

            {error && <div className="text-red-600 p-2 bg-red-50 border border-red-200 rounded">{error}</div>}
            {success && <div className="text-green-700 p-2 bg-green-50 border border-green-200 rounded">{success}</div>}

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={saving} className="px-5 py-2 bg-slate-800 text-white rounded">{saving ? 'Saving…' : 'Save Goal'}</button>
              <button type="button" onClick={() => router.push("/cart")} className="px-4 py-2 border rounded hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
