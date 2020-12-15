import React, { Component } from "react";

class EditableInput extends Component {
	onChange = ({ currentTarget }) => {
		const { onValueChange } = this.props;
		const { value } = currentTarget;
		if (onValueChange !== undefined) {
			onValueChange(value);
		}
	};
	render() {
		const {
			name,
			label,
			value,
			edit,
			editValueTransformer,
			readValueTransformer,
			onValueChange,
			editCreator,
			...rest
		} = this.props;
		const id = (edit ? "input_" : "text_") + name;
		const transformer = edit ? editValueTransformer : readValueTransformer;
		const transformedValue =
			transformer !== undefined ? transformer(value) : value;
		return (
			<div className="form-group">
				<div className="row col-md-12">
					<label>
						{label}
						{edit ? (
							editCreator ? (
								editCreator()
							) : (
								<input
									{...rest}
									name={name}
									id={id}
									className="form-control"
									value={transformedValue}
									onChange={this.onChange}
								/>
							)
						) : (
							<span id={id} style={{ marginLeft: "10px" }}>
								{transformedValue}
							</span>
						)}
					</label>
				</div>
			</div>
		);
	}
}
export default EditableInput;

export function booleanTransformerToString(value) {
	return value ? "ATTIVO" : "NON ATTIVO";
}
