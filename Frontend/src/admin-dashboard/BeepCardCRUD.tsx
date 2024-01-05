import { useMemo, useState } from 'react';
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { type BeepCard, Data } from './BeepCard';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Example = () => {
  const [valUUICationErrors, setValUUICationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo<MRT_ColumnDef<BeepCard>[]>(
    () => [
      {
        accessorKey: 'UUIC',
        header: 'UUIC',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'Bal',
        header: 'Balance',
        muiEditTextFieldProps: {
          type: 'email',
          required: true,
          error: !!valUUICationErrors?.firstName,
          helperText: valUUICationErrors?.firstName,
          //remove any previous valUUICation errors when BeepCard focuses on the input
          onFocus: () =>
            setValUUICationErrors({
              ...valUUICationErrors,
              firstName: undefined,
            }),
          //optionally add valUUICation checking for onBlur or onChange
        },
      },
    ],
    [valUUICationErrors],
  );

  //call CREATE hook
  const { mutateAsync: createBeepCard, isPending: isCreatingBeepCard } =
    useCreateBeepCard();
  //call READ hook
  const {
    data: fetchedBeepCards = [],
    isError: isLoadingBeepCardsError,
    isFetching: isFetchingBeepCards,
    isLoading: isLoadingBeepCards,
  } = useGetBeepCards();
  //call UPDATE hook
  const { mutateAsync: updateBeepCard, isPending: isUpdatingBeepCard } =
    useUpdateBeepCard();
  //call DELETE hook
  const { mutateAsync: deleteBeepCard, isPending: isDeletingBeepCard } =
    useDeleteBeepCard();

  //CREATE action
  const handleCreateBeepCard: MRT_TableOptions<BeepCard>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValUUICationErrors = valUUICateBeepCard(values);
    if (Object.values(newValUUICationErrors).some((error) => error)) {
      setValUUICationErrors(newValUUICationErrors);
      return;
    }
    setValUUICationErrors({});
    await createBeepCard(values);
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveBeepCard: MRT_TableOptions<BeepCard>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValUUICationErrors = valUUICateBeepCard(values);
    if (Object.values(newValUUICationErrors).some((error) => error)) {
      setValUUICationErrors(newValUUICationErrors);
      return;
    }
    setValUUICationErrors({});
    await updateBeepCard(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<BeepCard>) => {
    if (window.confirm('Are you sure you want to delete this BeepCard?')) {
      deleteBeepCard(row.original.UUIC);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedBeepCards,
    createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
    editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.UUIC,
    muiToolbarAlertBannerProps: isLoadingBeepCardsError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: '500px',
      },
    },
    onCreatingRowCancel: () => setValUUICationErrors({}),
    onCreatingRowSave: handleCreateBeepCard,
    onEditingRowCancel: () => setValUUICationErrors({}),
    onEditingRowSave: handleSaveBeepCard,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Create New BeepCard</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    //optionally customize modal content
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Edit BeepCard</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        Create New BeepCard
      </Button>
    ),
    state: {
      isLoading: isLoadingBeepCards,
      isSaving: isCreatingBeepCard || isUpdatingBeepCard || isDeletingBeepCard,
      showAlertBanner: isLoadingBeepCardsError,
      showProgressBars: isFetchingBeepCards,
    },
  });

  return <MaterialReactTable table={table} />;
};

//Create Random ID
function generateRandomID(): string {
  const prefix = "637805";
  const randomDigits = Math.floor(Math.random() * 1e10).toString().padStart(10, '0');
  const generatedID = prefix + randomDigits;
  return generatedID;
}


//CREATE hook (post new BeepCard to api)
function useCreateBeepCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (BeepCard: BeepCard) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newBeepCardInfo: BeepCard) => {
      queryClient.setQueryData(
        ['BeepCards'],
        (prevBeepCards: any) =>
          [
            ...prevBeepCards,
            {
              ...newBeepCardInfo,
              UUIC: generateRandomID()
            },
          ] as BeepCard[],
      );
    },
    // onSettled: () => queryClient.invalUUICateQueries({ queryKey: ['BeepCards'] }), //refetch BeepCards after mutation, disabled for demo
  });
}

//READ hook (get BeepCards from api)
function useGetBeepCards() {
  return useQuery<BeepCard[]>({
    queryKey: ['BeepCards'],
    queryFn: async () => {
      //send api request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve(Data);
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put BeepCard in api)
function useUpdateBeepCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (BeepCard: BeepCard) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client sUUICe optimistic update
    onMutate: (newBeepCardInfo: BeepCard) => {
      queryClient.setQueryData(
        ['BeepCards'],
        (prevBeepCards: any) =>
          prevBeepCards?.map((prevBeepCard: BeepCard) =>
            prevBeepCard.UUIC === newBeepCardInfo.UUIC ? newBeepCardInfo : prevBeepCard,
          ),
      );
    },
    // onSettled: () => queryClient.invalUUICateQueries({ queryKey: ['BeepCards'] }), //refetch BeepCards after mutation, disabled for demo
  });
}

//DELETE hook (delete BeepCard in api)
function useDeleteBeepCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (BeepCardUUIC: string) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client sUUICe optimistic update
    onMutate: (BeepCardUUIC: string) => {
      queryClient.setQueryData(
        ['BeepCards'],
        (prevBeepCards: any) =>
          prevBeepCards?.filter((BeepCard: BeepCard) => BeepCard.UUIC !== BeepCardUUIC),
      );
    },
    // onSettled: () => queryClient.invalUUICateQueries({ queryKey: ['BeepCards'] }), //refetch BeepCards after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const ExampleWithProvUUICers = () => (
  //Put this with your other react-query provUUICers near root of your app
  <QueryClientProvider client={queryClient}>
    <Example />
  </QueryClientProvider>
);

export default ExampleWithProvUUICers;
const valUUICateRequired = (value: number) => value;

function valUUICateBeepCard(BeepCard: BeepCard) {
  return {
    firstName: !valUUICateRequired(BeepCard.Bal)
      ? 'Please Fill Up Balance.'
      : '',
  };
}