import React from 'react';
import './App.css';
import {
    Button, Dialog, DialogContent, DialogActions, DialogTitle, DialogContentText,
} from '@mui/material';

interface Props {
    open: boolean
    sessionName: string
    onConfirm: () => void
    onCancel: () => void
}

export default function DeleteConfirmationDialog(props: Props) {
    return (
        <Dialog open={props.open} onClose={props.onCancel}>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete the session <strong>"{props.sessionName}"</strong>? 
                    This action cannot be undone and all messages in this session will be permanently removed.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel}>Cancel</Button>
                <Button onClick={props.onConfirm} color="error">Delete</Button>
            </DialogActions>
        </Dialog>
    );
}

