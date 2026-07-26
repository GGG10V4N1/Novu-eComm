import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { sellerTableColumns } from "../../helper/tableColumn";

const SellerTable = ({ sellers, pagination }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pathname = useLocation().pathname;
  const params = new URLSearchParams(searchParams);
  const [currentPage, setCurrentPage] = useState(
    pagination?.pageNumber + 1 || 1
  );

  const tableRecords = sellers?.map((item) => {
    return {
      id: item.userId,
      username: item.username,
      email: item.email,
    };
  });

  const handlePaginationChange = (paginationModel) => {
    const newPageSize = paginationModel.pageSize;
    const currentUrlPageSize = Number(searchParams.get("pageSize")) || 10;

    if (newPageSize !== currentUrlPageSize) {
      params.set("page", "1");
      params.set("pageSize", newPageSize.toString());
    } else {
      const page = paginationModel.page + 1;
      setCurrentPage(page);
      params.set("page", page.toString());
    }
    navigate(`${pathname}?${params}`);
  };

  const isLastPage =
    pagination?.lastPage === true ||
    (pagination?.totalPages ? currentPage >= pagination.totalPages : false);

  return (
    <div>
      <div className="max-w-fit mx-auto">
        <DataGrid
          className="w-full"
          rows={tableRecords}
          paginationMode="server"
          rowCount={pagination?.totalElements || 0}
          columns={sellerTableColumns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: Number(searchParams.get("pageSize")) || 10,
                page: currentPage - 1,
              },
            },
          }}
          onPaginationModelChange={handlePaginationChange}
          disableRowSelectionOnClick
          disableColumnResize
          pagination
          pageSizeOptions={[5, 10, 25, 50, 100]}
          paginationOptions={{
            showFirstButton: true,
            showLastButton: true,
            hideNextButton: isLastPage,
          }}
        />
      </div>
    </div>
  );
};

export default SellerTable;
