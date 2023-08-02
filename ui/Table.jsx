'use client';
import { modeEnum, typeEnum } from '@/types/enums';
import styled from '@emotion/styled';
import {
  Add as AddIcon,
  Close as CancelIcon,
  DeleteOutlined as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { Button } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridRowModes,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  zhCN,
} from '@mui/x-data-grid';
import {
  randomArrayItem,
  randomId,
  randomTraderName,
} from '@mui/x-data-grid-generator';
import React from 'react';
import { toast } from 'react-hot-toast';
import { mutate } from 'swr';

const Container = styled.div`
  width: 100%;
  .MuiInputBase-input:focus {
    box-shadow: none;
    border: none;
  }
`;

// 随机type
const randomType = () => randomArrayItem(Object.keys(typeEnum));
// 随机模式
const randomMode = () => randomArrayItem(Object.keys(modeEnum));

// ADD
const createData = async (newData) => {
  const response = await fetch('/api/finance/debts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newData),
  });
  if (response.ok) {
    const createdData = await response.json();
    mutate('/api/finance/debts'); // Trigger revalidation
    return createdData;
  } else {
    toast.error(await response.text());
  }
};

// update
const updateData = async (id, update = {}) => {
  const response = await fetch(`/api/finance/debts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });
  if (response.ok) {
    const updatedData = await response.json();
    mutate(`/api/finance/debts/${id}`); // Trigger revalidation
    return updatedData;
  } else {
    toast.error(await response.text());
  }
};

// delete
const deleteData = async (id) => {
  const response = await fetch(`/api/finance/debts/${id}`, {
    method: 'DELETE',
  });
  if (response.ok) {
    const deletedData = await response.json();
    mutate(`/api/finance/debts/${id}`, deletedData, false); // Update the cache without revalidation
    mutate('/api/finance/debts'); // Trigger revalidation
    return deletedData;
  } else {
    toast.error(await response.text());
  }
};

// 可编辑toolbar
function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;
  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        name: randomTraderName(),
        type: randomType(),
        amount: 0,
        rate: 0,
        borrowDate: new Date(),
        repaymentMode: randomMode(),
        isNew: true,
        installment: 1,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        添加
      </Button>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}
export default function Table({
  initialRows = [],
  columns = [
    {
      field: 'no',
      headerName: '序号',
      valueFormatter: ({ id }) => id + 1,
    },
    {
      field: 'name',
      headerName: '条目',
      type: 'string',
      flex: 1,
      editable: true,
    },
    {
      field: 'type',
      headerName: '类型',
      flex: 1,
      type: 'singleSelect',
      valueOptions: Object.keys(typeEnum).map((key) => ({
        value: key,
        label: typeEnum[key],
      })),
      editable: true,
    },
    {
      field: 'amount',
      headerName: '金额',
      type: 'number',
      flex: 1,
      editable: true,
    },
    {
      field: 'rate',
      headerName: '利率（%）',
      type: 'number',
      flex: 1,
      valueGetter: ({ value }) => value * 100,
      editable: true,
    },
    {
      field: 'borrowDate',
      headerName: '借款日期',
      type: 'date',
      flex: 1,
      editable: true,
      valueGetter: ({ value }) => new Date(value),
    },
    {
      field: 'installment',
      headerName: '周期',
      type: 'number',
      flex: 1,
      editable: true,
    },
    {
      field: 'repaymentMode',
      headerName: '还款方式',
      type: 'singleSelect',
      flex: 1,
      valueOptions: Object.keys(modeEnum).map((key) => ({
        value: key,
        label: modeEnum[key],
      })),
      editable: true,
    },
  ],
}) {
  const [rows, setRows] = React.useState(initialRows);
  const [rowModesModel, setRowModesModel] = React.useState({});

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };
  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    setRows(rows.filter((row) => row.id !== id));
    deleteData(id);
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  // 更新利率
  const updateRate = (newRow) => ({ ...newRow, rate: newRow.rate / 100 });

  // 处理保存或者更新动作
  const processRowUpdate = async (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    if (newRow.isNew) {
      const createdData = await createData(updateRate(newRow)); // Call createData and wait for the response
      const updatedRows = rows.map((row) =>
        row.id === newRow.id ? createdData : row,
      ); // Replace the new row with the created data
      setRows(updatedRows); // Update the rows array with the created data
    } else {
      const updateRow = await updateData(newRow.id, updateRate(newRow));
      const updatedRows = rows.map((row) =>
        row.id === newRow.id ? updateRow : row,
      ); // sert the new row into the rows array
      setRows(updatedRows);
    }
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columnsWithActions = [
    ...columns,
    {
      field: 'actions',
      type: 'actions',
      headerName: '操作',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];
  return (
    <Container>
      <DataGrid
        density="standard"
        localeText={zhCN.components.MuiDataGrid.defaultProps.localeText}
        autoHeight
        rows={rows}
        columns={columnsWithActions}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
      />
    </Container>
  );
}
