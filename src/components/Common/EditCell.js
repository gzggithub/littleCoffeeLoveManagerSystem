import React, {Component} from 'react';

// 可编辑的单元格
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends Component {
    state = {
        editing: false,
    }

    toggleEdit = (valuess) => {
        console.log(valuess);
        const editing = !this.state.editing;
        this.setState({ editing }, () => {
            if (editing) {
                this.input.focus();
            }
        });
    }

    sort = (props1, e) => {
        const { record, handleSort } = this.props;
        this.form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return;
            }
            this.toggleEdit();
            // 判断排序值是否改变，不变就不用排序，只有改变才请求sort接口
            if (props1 !== Number(values.sort)) {
                handleSort({ ...record, ...values });
            } 
        });
    }

    render() {
        const { editing } = this.state;
        const { editable, dataIndex, title, record, index, handleSort, ...restProps } = this.props;
        return (
            <td {...restProps}>
                {
                    editable ? 
                        <EditableContext.Consumer>
                            {
                                (form) => {
                                    this.form = form;
                                    return (
                                        editing ?                                         
                                            <FormItem style={{ margin: 0 }}>
                                                {form.getFieldDecorator(dataIndex, {
                                                    initialValue: record[dataIndex],
                                                    rules: [{
                                                        required: false,                                   
                                                        message: "只能输入数字",                                    
                                                    }]
                                                })(
                                                    <Input style={{textAlign: "center"}}
                                                        // allowClear
                                                        ref={node => (this.input = node)}
                                                        onPressEnter={() => this.sort(this, record[dataIndex])}
                                                        onBlur={() => this.sort(this, record[dataIndex])}
                                                        placeholder="双击设置排序"/>
                                                )}
                                            </FormItem>
                                            :
                                            <div onClick={this.toggleEdit} className="editable-cell-value-wrap">
                                                <Input style={{textAlign: "center"}}
                                                    // allowClear
                                                    ref= {node => (this.input = node)}
                                                    value={record[dataIndex]}
                                                    placeholder="双击设置排序"/>
                                            </div>
                                    );
                                }
                            }
                        </EditableContext.Consumer>
                        : 
                        restProps.children
                }
            </td>
        );
    }
}

export default EditableCell;