import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import RecentOrders from "../../components/ecommerce/RecentOrders";

export default function Products() {
  return (
    <div>
      <PageMeta
        title="AY Developers | Products"
        description="A list of products available in the AY Developers store"
      />
      <PageBreadcrumb pageTitle="Product Page" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Card Title Here
          </h3>

          <div className="col-span-12 xl:col-span-12">
            <RecentOrders />
          </div>
        </div>
      </div>
    </div>
  );
}
