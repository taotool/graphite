import { useState, useRef, memo, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
const TreePaneFR = forwardRef(function TreePane({ appRef, loadApp, searchField, showTable, splitRef }, ref) {
  console.log("tree pane is refreshed")
  const fieldRef = useRef("");
  const navigate = useNavigate();
  const [fieldTree, setFieldTree] = useState([]);
  const [expandedItems, setExpandedItems] = React.useState([]);

  const changeSearchField = (value) => {
    // Update the state with the new value
    console.log("triggered by " + value);
    fieldRef.current = value;

    if (value === "") {
      searchField();
    } else {
      searchField(value);
    }
  };

  function handleSearch(event) {
    searchField(fieldRef.current);
  }
  const [value, setValue] = useState("");

  const handleChange = (event) => {
    // Update the state with the new value
    setValue(event.target.value);
    changeSearchField(event.target.value);
  };
  function SelectBox() {
    const handleChange = (event) => {
      appRef.current = event.target.value;
      fieldRef.current = "";
      loadApp(event.target.value);
    };
  
    return (
      <Stack id="sb" spacing={1} direction="row">
        <FormControl id="sb-fc" variant="standard" sx={{ m: 2, minWidth: 150, width: '100%' }}>
          <InputLabel id="demo-simple-select-standard-label">App</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={appRef.current}
            onChange={handleChange}
          >
            <MenuItem value='sample'>Sample</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    );
  }

  // Expose methods to the parent via ref
  useImperativeHandle(ref, () => ({
    updateFieldTree(ft, v) {
      setFieldTree(ft);
      fieldRef.current = v;
    },
    // handleExpandClick(expanded) {
    //   if (expanded) {
    //     setExpandedItems(getAllItemsWithChildrenItemIds());
    //   } else {
    //     setExpandedItems([]);
    //   }
    // }
  }));
  const handleExpandedItemsChange = (event, itemIds) => {
    setExpandedItems(itemIds);
  };
  const getAllItemsWithChildrenItemIds = () => {
    const itemIds = [];
    const registerItemId = (item) => {
      if (item.children?.length) {
        itemIds.push(item.id);
        item.children.forEach(registerItemId);
      }
    };

    fieldTree.forEach(registerItemId);
    return itemIds;
  };
  const expandTree = () => {
    const toExpand = getAllItemsWithChildrenItemIds();
    console.log("toExpand: " + toExpand)
    setExpandedItems(toExpand);
  };
  const collapseTree = () => {
    const toExpand = [];
    setExpandedItems(toExpand);
  };
  const handleExpandClick = () => {
    setExpandedItems((oldExpanded) =>
      oldExpanded.length === 0 ? getAllItemsWithChildrenItemIds() : [],
    );
  };
  const [action, setAction] = useState(null);

  const handleItemClick = (event, itemId, isExpanded) => {
    setAction({ itemId, isExpanded });
    showTable(itemId);
  };
  useEffect(() => {
    if (!fieldRef.current || fieldRef.current == "") {
      //collapseTree();
    } else {
      expandTree();
    }
  }, [fieldTree]);
  return (
    <div className="FlexScrollPaneInFlex">

      <Stack spacing={0} direction="row-reverse" sx={{
        justifyContent: "space-between",
        alignItems: "center",
        paddingRight: "8px"
      }}>

        <IconButton color="primary" aria-label="Close" onClick={() => navigate("/graphites")} >
          <CloseIcon />
        </IconButton>
        <IconButton color="primary" aria-label="Expand" onClick={() => expandTree()}>
          <UnfoldMoreIcon />
        </IconButton>
        <IconButton color="primary" aria-label="Collapse" onClick={() => collapseTree()}>
          <UnfoldLessIcon />
        </IconButton>
        <IconButton color="primary" aria-label="Minimize" onClick={() => splitRef.current.resize([2000, 0])}>
          <RemoveIcon />
        </IconButton>
      </Stack>

      <div className="FlexScrollPaneInFlex">
        <RichTreeView
          expandedItems={expandedItems}
          onExpandedItemsChange={handleExpandedItemsChange}
          items={fieldTree}
          onItemClick={handleItemClick} />
      </div>

      <TextField
        id="standard-basic"
        variant="standard"
        label="Search"
        margin="dense"
        value={value}
        onChange={handleChange}

      />
    </div>
  );
});

export default memo(TreePaneFR);
