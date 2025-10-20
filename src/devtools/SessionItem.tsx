import React, { useEffect, useRef } from 'react';
import './App.css';
import {
    ListItemText, ListItemAvatar, MenuItem, Divider,
    Avatar, IconButton, Button, TextField, Popper, Fade, Typography, ListItemIcon,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Session } from './types'
import FileCopyIcon from '@mui/icons-material/FileCopy';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import StyledMenu from './StyledMenu';

const { useState } = React

export interface Props {
    session: Session
    selected: boolean
    switchMe: () => void
    deleteMe: () => void
    copyMe: () => void
    editMe: () => void
    onDragStart: (sessionId: string) => void
    onDragEnd: () => void
    onDragOver: (event: React.DragEvent, index: number) => void
    onDrop: (event: React.DragEvent, index: number) => void
    index: number
    isDragging: boolean
}

export default function SessionItem(props: Props) {
    const { session, selected, switchMe, deleteMe, copyMe, editMe, onDragStart, onDragEnd, onDragOver, onDrop, index, isDragging } = props
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <MenuItem
            key={session.id}
            selected={selected}
            onClick={() => switchMe()}
            draggable={!open}
            onDragStart={() => onDragStart(session.id)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => onDragOver(e, index)}
            onDrop={(e) => onDrop(e, index)}
            sx={{
                userSelect: 'none',
                cursor: open ? 'default' : 'grab',
                '&:active': {
                    cursor: open ? 'default' : 'grabbing'
                },
                ...(isDragging && {
                    opacity: 0.3,
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    border: '2px dashed #1976d2',
                    borderRadius: '4px',
                    transform: 'rotate(2deg)',
                    '& *': {
                        visibility: 'hidden'
                    },
                    '& .MuiListItemText-root': {
                        visibility: 'visible',
                        '& .MuiTypography-root': {
                            fontWeight: 'bold',
                            color: '#1976d2'
                        }
                    }
                })
            }}
        >
            <ListItemIcon>
                <IconButton><ChatBubbleOutlineOutlinedIcon fontSize="small" /></IconButton>
            </ListItemIcon>
            <ListItemText>
                <Typography variant="inherit" noWrap>
                    {session.name}
                </Typography>
            </ListItemText>
            <IconButton onClick={handleClick}>
                <MoreHorizOutlinedIcon />
            </IconButton>
            <StyledMenu
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem key={session.id + 'edit'} onClick={() => {
                    editMe()
                    handleClose()
                }} disableRipple>
                    <EditIcon />
                    Rename
                </MenuItem>

                <MenuItem key={session.id + 'copy'} onClick={() => {
                    copyMe()
                    handleClose()
                }} disableRipple>
                    <FileCopyIcon fontSize='small' />
                    Copy
                </MenuItem>

                <Divider sx={{ my: 0.5 }} />

                <MenuItem key={session.id + 'del'} onClick={() => {
                    setAnchorEl(null)
                    handleClose()
                    deleteMe()
                }} disableRipple
                >
                    <DeleteForeverIcon />
                    Delete
                </MenuItem>

            </StyledMenu>
        </MenuItem>
    )
}
