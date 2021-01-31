import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faFileDownload,
	faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export const DownloadButton = ({ link, ...rest }) => {
	const content = <FontAwesomeIcon icon={faFileDownload} />;
	return (
		<Button href={link} content={content} classes="btn-success" {...rest} />
	);
};

export const ConfirmButton = ({ text, action, ...rest }) => {
	return (
		<Button
			classes="btn-success"
			content={text}
			onClick={action}
			{...rest}
		/>
	);
};

export const CancelButton = ({ text, action, ...rest }) => {
	return (
		<Button
			classes="btn-danger"
			content={text}
			onClick={action}
			{...rest}
		/>
	);
};

export const OpenFirmButton = ({ firm, ...rest }) => {
	const href = "/firm/" + firm.id;
	return <GoButton useLink={true} href={href} {...rest} />;
};

export const IconButton = ({ icon, text, onClick, ...rest }) => {
	const content = <FontAwesomeIcon icon={icon} />;
	return (
		<Button content={content} content2={text} onClick={onClick} {...rest} />
	);
};

export const GoButton = ({ onClick, ...rest }) => {
	return (
		<IconButton
			classes="btn-success"
			icon={faArrowRight}
			onClick={onClick}
			{...rest}
		/>
	);
};

class Button extends Component {
	render() {
		const buttonStyle = {
			minWidth: "50px",
		};
		const {
			content,
			content2,
			useLink,
			href,
			onClick,
			classes,
			tooltip,
			...other
		} = this.props;
		const btn = (
			<button
				style={buttonStyle}
				className={"btn" + (classes ? " " + classes : "")}
				onClick={onClick}
				title={tooltip}
				{...other}
			>
				{content} {content2}
			</button>
		);
		if (useLink && href) {
			return <Link to={href}>{btn}</Link>;
		}
		if (href) {
			return (
				<a href={href} rel="noreferrer" target="_blank">
					{btn}
				</a>
			);
		}
		return btn;
	}
}

export default Button;
