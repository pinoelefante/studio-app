import React, { Component } from "react";

class Form extends Component {
	state = {
		data: {},
		errors: {},
	};

	validate = () => {
		/*
		const options = { abortEarly: false };
		const { error } = Joi.validate(this.state.data, this.schema, options);
		if (!error) return null;

		const errors = {};
		for (let item of error.details) errors[item.path[0]] = item.message;
        return errors;
        */
		return {};
	};

	validateProperty = ({ name, value }) => {
		/*
		const obj = { [name]: value };
		const schema = { [name]: this.schema[name] };
		const { error } = Joi.validate(obj, schema);
        return error ? error.details[0].message : null;
        */
		return null;
	};

	handleSubmit = (e) => {
		e.preventDefault();
/*
		const errors = this.validate();
		this.setState({ errors });
		if (errors) return;
*/
		this.doSubmit();
	};

	handleChange = ({ currentTarget: input }) => {
		const errors = { ...this.state.errors };
		const errorMessage = this.validateProperty(input);
		if (errorMessage) errors[input.name] = errorMessage;
		else delete errors[input.name];

		const data = { ...this.state.data };
		data[input.name] = input.value;
		this.setState({ data, errors });
	};

	handleCheck = ({ currentTarget: input }) => {
		const errors = { ...this.state.errors };
		const errorMessage = this.validateProperty(input);
		if (errorMessage) errors[input.name] = errorMessage;
		else delete errors[input.name];

		const data = { ...this.state.data };
		data[input.name] = input.checked;
		this.setState({ data, errors });
	};

	renderSubmit(label) {
		return (
			<button className="btn btn-primary" onClick={this.handleSubmit}>
				{label}
			</button>
		);
	}

	renderInput(name, label, type = "text") {
		const { data, errors } = this.state;
		return (
			<Input
				type={type}
				name={name}
				label={label}
				value={data[name]}
				error={errors[name]}
				onChange={this.handleChange}
			/>
		);
	}

	renderCheckbox(name, label) {
		const { data, errors } = this.state;
		return (
			<Checkbox
				name={name}
				label={label}
				value={data[name]}
				error={errors[name]}
				onChange={this.handleCheck}
			/>
		);
	}
}

export default Form;

const Checkbox = ({ name, label, value, error, ...rest }) => {
	return (
		<div className="form-check">
			<input
				className="form-check-input"
				type="checkbox"
				name={name}
				id={name}
				value={value}
				checked={value ? "checked" : ""}
				{...rest}
			/>
			<label className="form-check-label" htmlFor={name}>
				{label}
			</label>
		</div>
	);
};

const Input = ({ name, label, error, ...rest }) => {
	return (
		<div className="form-group">
			<label htmlFor={name}>{label}</label>
			<input {...rest} name={name} id={name} className="form-control" />
			{error && <div className="alert alert-danger"></div>}
		</div>
	);
};
